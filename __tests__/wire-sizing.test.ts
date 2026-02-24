/**
 * Wire Sizing Calculator Tests — CEC 2021 Table 2, Table 5A, Table 5C, Rule 4-006
 *
 * These tests verify the wire sizing calculation logic against known CEC examples
 * and edge cases. Getting wire sizing wrong is the MOST dangerous calculation error
 * because undersized wire causes overheating and fire.
 */

import { calculateWireSizing, WireSizingInput, WireSizingResult } from '../utils/wire-sizing';

function expectResult(result: WireSizingResult | { error: string }): WireSizingResult {
  expect(result).not.toHaveProperty('error');
  return result as WireSizingResult;
}

function expectError(result: WireSizingResult | { error: string }): string {
  expect(result).toHaveProperty('error');
  return (result as { error: string }).error;
}

// ============================================================
// Basic Wire Sizing — Standard Conditions (30°C, ≤3 conductors)
// ============================================================
describe('Wire Sizing — Standard Conditions', () => {
  test('15A copper 75°C → #14 AWG (20A at 75°C)', () => {
    const result = expectResult(calculateWireSizing({
      material: 'copper', insulationTemp: 75, requiredAmps: 15,
      ambientTemp: 30, numConductors: 3,
    }));
    expect(result.recommendedSize).toBe('14');
    expect(result.ampacityAtRatedTemp).toBe(20);
  });

  test('20A copper 75°C → #14 AWG (20A at 75°C, smallest wire that meets requirement)', () => {
    // #14 at 75°C = 20A which exactly meets 20A requirement
    // NOTE: overcurrent limit for #14 is 15A — user must check breaker sizing separately
    const result = expectResult(calculateWireSizing({
      material: 'copper', insulationTemp: 75, requiredAmps: 20,
      ambientTemp: 30, numConductors: 3,
    }));
    expect(result.recommendedSize).toBe('14');
    expect(result.ampacityAtRatedTemp).toBe(20);
    expect(result.overcurrentLimit).toBe(15); // #14 max 15A breaker
  });

  test('21A copper 75°C → #12 AWG (25A at 75°C)', () => {
    // 21A exceeds #14's 20A capacity, so #12 (25A) is needed
    const result = expectResult(calculateWireSizing({
      material: 'copper', insulationTemp: 75, requiredAmps: 21,
      ambientTemp: 30, numConductors: 3,
    }));
    expect(result.recommendedSize).toBe('12');
    expect(result.ampacityAtRatedTemp).toBe(25);
  });

  test('30A copper 75°C → #10 AWG (35A at 75°C)', () => {
    const result = expectResult(calculateWireSizing({
      material: 'copper', insulationTemp: 75, requiredAmps: 30,
      ambientTemp: 30, numConductors: 3,
    }));
    expect(result.recommendedSize).toBe('10');
    expect(result.ampacityAtRatedTemp).toBe(35);
  });

  test('100A copper 75°C → #3 AWG (100A at 75°C)', () => {
    const result = expectResult(calculateWireSizing({
      material: 'copper', insulationTemp: 75, requiredAmps: 100,
      ambientTemp: 30, numConductors: 3,
    }));
    expect(result.recommendedSize).toBe('3');
    expect(result.ampacityAtRatedTemp).toBe(100);
  });

  test('200A copper 75°C → #3/0 AWG (200A at 75°C)', () => {
    const result = expectResult(calculateWireSizing({
      material: 'copper', insulationTemp: 75, requiredAmps: 200,
      ambientTemp: 30, numConductors: 3,
    }));
    expect(result.recommendedSize).toBe('3/0');
    expect(result.ampacityAtRatedTemp).toBe(200);
  });

  test('standard conditions return correction factor 1.0 and derating factor 1.0', () => {
    const result = expectResult(calculateWireSizing({
      material: 'copper', insulationTemp: 75, requiredAmps: 20,
      ambientTemp: 30, numConductors: 3,
    }));
    expect(result.tempCorrectionFactor).toBe(1.0);
    expect(result.deratingFactor).toBe(1.0);
  });
});

// ============================================================
// Ambient Temperature Derating
// ============================================================
describe('Wire Sizing — Ambient Temperature Derating', () => {
  test('100A copper 90°C at 40°C ambient: uses 0.91 correction factor', () => {
    const result = expectResult(calculateWireSizing({
      material: 'copper', insulationTemp: 90, requiredAmps: 100,
      ambientTemp: 40, numConductors: 3,
    }));
    expect(result.tempCorrectionFactor).toBe(0.91);
    // adjusted = 100 / 0.91 = 109.89A
    // Looking for 90°C >= 109.89: #3 = 115A ≥ 109.89 → #3 AWG
    expect(result.recommendedSize).toBe('3');
  });

  test('100A copper 75°C at 40°C ambient: uses 0.88 correction factor', () => {
    const result = expectResult(calculateWireSizing({
      material: 'copper', insulationTemp: 75, requiredAmps: 100,
      ambientTemp: 40, numConductors: 3,
    }));
    expect(result.tempCorrectionFactor).toBe(0.88);
    // adjusted = 100 / 0.88 = 113.64A
    // Looking for 75°C >= 113.64: #2 = 115A ≥ 113.64 → #2 AWG
    expect(result.recommendedSize).toBe('2');
  });

  test('hot ambient INCREASES required wire size', () => {
    // At 30°C: 100A copper 75°C → #3 AWG
    const normalResult = expectResult(calculateWireSizing({
      material: 'copper', insulationTemp: 75, requiredAmps: 100,
      ambientTemp: 30, numConductors: 3,
    }));
    // At 45°C: should require larger wire
    const hotResult = expectResult(calculateWireSizing({
      material: 'copper', insulationTemp: 75, requiredAmps: 100,
      ambientTemp: 45, numConductors: 3,
    }));
    // Wire sizes are ordered small to large in the table
    // A larger recommended size means the wire is bigger
    const sizeOrder = ['14','12','10','8','6','4','3','2','1','1/0','2/0','3/0','4/0'];
    const normalIdx = sizeOrder.indexOf(normalResult.recommendedSize);
    const hotIdx = sizeOrder.indexOf(hotResult.recommendedSize);
    expect(hotIdx).toBeGreaterThan(normalIdx);
  });
});

// ============================================================
// Conductor Bundling Derating
// ============================================================
describe('Wire Sizing — Conductor Bundling Derating', () => {
  test('100A copper 90°C with 7 conductors: uses 0.70 derating', () => {
    const result = expectResult(calculateWireSizing({
      material: 'copper', insulationTemp: 90, requiredAmps: 100,
      ambientTemp: 30, numConductors: 7,
    }));
    expect(result.deratingFactor).toBe(0.70);
    // adjusted = 100 / (1.0 * 0.70) = 142.86A
    // Looking for 90°C >= 142.86: #1 = 145A ≥ 142.86 → #1 AWG
    expect(result.recommendedSize).toBe('1');
  });

  test('more conductors INCREASES required wire size', () => {
    const fewResult = expectResult(calculateWireSizing({
      material: 'copper', insulationTemp: 90, requiredAmps: 100,
      ambientTemp: 30, numConductors: 3,
    }));
    const manyResult = expectResult(calculateWireSizing({
      material: 'copper', insulationTemp: 90, requiredAmps: 100,
      ambientTemp: 30, numConductors: 25,
    }));
    const sizeOrder = ['14','12','10','8','6','4','3','2','1','1/0','2/0','3/0','4/0'];
    expect(sizeOrder.indexOf(manyResult.recommendedSize))
      .toBeGreaterThan(sizeOrder.indexOf(fewResult.recommendedSize));
  });
});

// ============================================================
// Combined Derating (Ambient + Bundling)
// ============================================================
describe('Wire Sizing — Combined Derating', () => {
  test('100A copper 90°C at 40°C with 7 conductors', () => {
    const result = expectResult(calculateWireSizing({
      material: 'copper', insulationTemp: 90, requiredAmps: 100,
      ambientTemp: 40, numConductors: 7,
    }));
    expect(result.tempCorrectionFactor).toBe(0.91);
    expect(result.deratingFactor).toBe(0.70);
    // adjusted = 100 / (0.91 * 0.70) = 100 / 0.637 = 156.99A
    // 90°C column: 1/0 = 170A ≥ 156.99 → #1/0 AWG
    expect(result.recommendedSize).toBe('1/0');
  });
});

// ============================================================
// Rule 4-006 Termination Temperature
// ============================================================
describe('Wire Sizing — Rule 4-006 Termination Temperature', () => {
  test('90°C insulation always shows termination warning', () => {
    const result = expectResult(calculateWireSizing({
      material: 'copper', insulationTemp: 90, requiredAmps: 20,
      ambientTemp: 30, numConductors: 3,
    }));
    expect(result.terminationWarning).toBe(true);
    expect(result.terminationAmpacity).not.toBeNull();
  });

  test('75°C insulation does NOT show termination warning', () => {
    const result = expectResult(calculateWireSizing({
      material: 'copper', insulationTemp: 75, requiredAmps: 20,
      ambientTemp: 30, numConductors: 3,
    }));
    expect(result.terminationWarning).toBe(false);
    expect(result.terminationAmpacity).toBeNull();
  });

  test('60°C insulation does NOT show termination warning', () => {
    const result = expectResult(calculateWireSizing({
      material: 'copper', insulationTemp: 60, requiredAmps: 20,
      ambientTemp: 30, numConductors: 3,
    }));
    expect(result.terminationWarning).toBe(false);
  });

  test('90°C upsizes when 75°C column insufficient for load', () => {
    // 30A load, 90°C, standard conditions
    // 90°C column: #12 = 30A → selected initially
    // But #12 at 75°C = 25A < 30A → must upsize
    // #10 at 75°C = 35A ≥ 30A AND 90°C = 40A ≥ 30A → #10
    const result = expectResult(calculateWireSizing({
      material: 'copper', insulationTemp: 90, requiredAmps: 30,
      ambientTemp: 30, numConductors: 3,
    }));
    expect(result.recommendedSize).toBe('10');
    expect(result.terminationAmpacity).toBe(35); // 75°C ampacity of #10
  });

  test('90°C derating benefit preserved when termination is satisfied', () => {
    // 100A load, 45°C ambient, 90°C, 10 conductors
    // temp factor 90°C: 0.87, derate: 0.70
    // adjusted = 100 / (0.87 * 0.70) = 164.2A
    // 90°C column: 1/0 = 170A ≥ 164.2 → 1/0
    // 75°C check: 1/0 = 150A ≥ 100A → OK
    const result = expectResult(calculateWireSizing({
      material: 'copper', insulationTemp: 90, requiredAmps: 100,
      ambientTemp: 45, numConductors: 10,
    }));
    expect(result.recommendedSize).toBe('1/0');
  });
});

// ============================================================
// Aluminum Conductor Tests
// ============================================================
describe('Wire Sizing — Aluminum Conductors', () => {
  test('100A aluminum 75°C → #1 AWG (100A at 75°C)', () => {
    const result = expectResult(calculateWireSizing({
      material: 'aluminum', insulationTemp: 75, requiredAmps: 100,
      ambientTemp: 30, numConductors: 3,
    }));
    expect(result.recommendedSize).toBe('1');
    expect(result.ampacityAtRatedTemp).toBe(100);
  });

  test('aluminum requires LARGER wire than copper for same ampacity', () => {
    const copperResult = expectResult(calculateWireSizing({
      material: 'copper', insulationTemp: 75, requiredAmps: 100,
      ambientTemp: 30, numConductors: 3,
    }));
    const aluminumResult = expectResult(calculateWireSizing({
      material: 'aluminum', insulationTemp: 75, requiredAmps: 100,
      ambientTemp: 30, numConductors: 3,
    }));
    // Copper #3 = 100A; Aluminum #1 = 100A
    const sizeOrder = ['14','12','10','8','6','4','3','2','1','1/0','2/0','3/0','4/0'];
    expect(sizeOrder.indexOf(aluminumResult.recommendedSize))
      .toBeGreaterThan(sizeOrder.indexOf(copperResult.recommendedSize));
  });
});

// ============================================================
// Overcurrent Protection Limits
// ============================================================
describe('Wire Sizing — Overcurrent Protection', () => {
  test('#14 AWG returns 15A overcurrent limit', () => {
    const result = expectResult(calculateWireSizing({
      material: 'copper', insulationTemp: 75, requiredAmps: 10,
      ambientTemp: 30, numConductors: 3,
    }));
    expect(result.recommendedSize).toBe('14');
    expect(result.overcurrentLimit).toBe(15);
  });

  test('#12 AWG returns 20A overcurrent limit', () => {
    const result = expectResult(calculateWireSizing({
      material: 'copper', insulationTemp: 75, requiredAmps: 21,
      ambientTemp: 30, numConductors: 3,
    }));
    expect(result.recommendedSize).toBe('12');
    expect(result.overcurrentLimit).toBe(20);
  });

  test('larger wire sizes return null overcurrent limit', () => {
    const result = expectResult(calculateWireSizing({
      material: 'copper', insulationTemp: 75, requiredAmps: 50,
      ambientTemp: 30, numConductors: 3,
    }));
    expect(result.overcurrentLimit).toBeNull();
  });

  test('aluminum #12 AWG returns 15A overcurrent limit (not 20A like copper)', () => {
    const result = expectResult(calculateWireSizing({
      material: 'aluminum', insulationTemp: 75, requiredAmps: 15,
      ambientTemp: 30, numConductors: 3,
    }));
    expect(result.recommendedSize).toBe('12');
    expect(result.overcurrentLimit).toBe(15);
  });

  test('aluminum #10 AWG returns 25A overcurrent limit (not 30A like copper)', () => {
    const result = expectResult(calculateWireSizing({
      material: 'aluminum', insulationTemp: 75, requiredAmps: 25,
      ambientTemp: 30, numConductors: 3,
    }));
    expect(result.recommendedSize).toBe('10');
    expect(result.overcurrentLimit).toBe(25);
  });
});

// ============================================================
// Error Handling
// ============================================================
describe('Wire Sizing — Error Handling', () => {
  test('rejects zero ampacity', () => {
    const error = expectError(calculateWireSizing({
      material: 'copper', insulationTemp: 75, requiredAmps: 0,
      ambientTemp: 30, numConductors: 3,
    }));
    expect(error).toContain('greater than 0');
  });

  test('rejects negative ampacity', () => {
    const error = expectError(calculateWireSizing({
      material: 'copper', insulationTemp: 75, requiredAmps: -10,
      ambientTemp: 30, numConductors: 3,
    }));
    expect(error).toContain('greater than 0');
  });

  test('rejects impossible ambient temp for 60°C insulation', () => {
    const error = expectError(calculateWireSizing({
      material: 'copper', insulationTemp: 60, requiredAmps: 20,
      ambientTemp: 58, numConductors: 3,
    }));
    expect(error).toContain('No correction factor');
  });

  test('returns error when ampacity exceeds table maximum', () => {
    const result = calculateWireSizing({
      material: 'copper', insulationTemp: 75, requiredAmps: 999999,
      ambientTemp: 30, numConductors: 3,
    });
    expect(result).toHaveProperty('error');
  });
});

// ============================================================
// CEC Reference String
// ============================================================
describe('Wire Sizing — CEC References', () => {
  test('result includes proper CEC rule references', () => {
    const result = expectResult(calculateWireSizing({
      material: 'copper', insulationTemp: 75, requiredAmps: 20,
      ambientTemp: 30, numConductors: 3,
    }));
    expect(result.cecReference).toContain('Table 2');
    expect(result.cecReference).toContain('Table 5A');
    expect(result.cecReference).toContain('Table 5C');
    expect(result.cecReference).toContain('Rule 4-006');
  });
});

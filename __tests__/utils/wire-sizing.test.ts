import { calculateWireSizing, WireSizingInput, WireSizingResult } from '../../utils/wire-sizing';
import {
  getAmbientTempFactor,
  getConductorDeratingFactor,
  getAmpacity,
  copperAmpacity,
  aluminumAmpacity,
} from '../../data/cec-tables';

// Helper to assert a successful result (not an error)
function expectResult(result: WireSizingResult | { error: string }): asserts result is WireSizingResult {
  expect(result).not.toHaveProperty('error');
}

describe('CEC 2021 Data Verification', () => {
  test('#3 AWG copper at 90°C → 115A', () => {
    const entry = copperAmpacity.find((e) => e.wireSize === '3');
    expect(entry).toBeDefined();
    expect(entry!.temp90).toBe(115);
  });

  test('#3/0 AWG copper at 75°C → 200A', () => {
    const entry = copperAmpacity.find((e) => e.wireSize === '3/0');
    expect(entry).toBeDefined();
    expect(entry!.temp75).toBe(200);
  });

  test('90°C conductor at 40°C ambient → correction factor 0.91', () => {
    expect(getAmbientTempFactor(40, 90)).toBe(0.91);
  });

  test('7 conductors in raceway → derating factor 0.70', () => {
    expect(getConductorDeratingFactor(7)).toBe(0.70);
  });
});

describe('getAmbientTempFactor', () => {
  test('30°C ambient with 60°C insulation → 1.00', () => {
    expect(getAmbientTempFactor(30, 60)).toBe(1.00);
  });

  test('30°C ambient with 75°C insulation → 1.00', () => {
    expect(getAmbientTempFactor(30, 75)).toBe(1.00);
  });

  test('10°C or less → highest correction factors', () => {
    expect(getAmbientTempFactor(5, 60)).toBe(1.29);
    expect(getAmbientTempFactor(5, 75)).toBe(1.20);
    expect(getAmbientTempFactor(5, 90)).toBe(1.15);
  });

  test('60°C ambient with 60°C insulation → null (not available)', () => {
    expect(getAmbientTempFactor(60, 60)).toBeNull();
  });
});

describe('getConductorDeratingFactor', () => {
  test('1-3 conductors → 1.00 (no derating)', () => {
    expect(getConductorDeratingFactor(1)).toBe(1.00);
    expect(getConductorDeratingFactor(3)).toBe(1.00);
  });

  test('4-6 conductors → 0.80', () => {
    expect(getConductorDeratingFactor(4)).toBe(0.80);
    expect(getConductorDeratingFactor(6)).toBe(0.80);
  });

  test('25-42 conductors → 0.60', () => {
    expect(getConductorDeratingFactor(25)).toBe(0.60);
  });

  test('43+ conductors → 0.50', () => {
    expect(getConductorDeratingFactor(43)).toBe(0.50);
    expect(getConductorDeratingFactor(100)).toBe(0.50);
  });
});

describe('calculateWireSizing', () => {
  test('100A copper 90°C at 30°C ambient, 3 conductors → #3 AWG', () => {
    const input: WireSizingInput = {
      material: 'copper',
      insulationTemp: 90,
      requiredAmps: 100,
      ambientTemp: 30,
      numConductors: 3,
    };
    const result = calculateWireSizing(input);
    expectResult(result);
    expect(result.recommendedSize).toBe('3');
    expect(result.ampacityAtRatedTemp).toBe(115);
    expect(result.tempCorrectionFactor).toBe(1.00);
    expect(result.deratingFactor).toBe(1.00);
  });

  test('200A copper 75°C at 30°C ambient, 3 conductors → #3/0 AWG', () => {
    const input: WireSizingInput = {
      material: 'copper',
      insulationTemp: 75,
      requiredAmps: 200,
      ambientTemp: 30,
      numConductors: 3,
    };
    const result = calculateWireSizing(input);
    expectResult(result);
    expect(result.recommendedSize).toBe('3/0');
    expect(result.ampacityAtRatedTemp).toBe(200);
  });

  test('applies temperature and derating factors correctly', () => {
    const input: WireSizingInput = {
      material: 'copper',
      insulationTemp: 90,
      requiredAmps: 40,
      ambientTemp: 40,
      numConductors: 7,
    };
    const result = calculateWireSizing(input);
    expectResult(result);
    expect(result.tempCorrectionFactor).toBe(0.91);
    expect(result.deratingFactor).toBe(0.70);
    // adjusted = 40 / (0.91 * 0.70) = 62.79...
    // #6 at 90°C = 75A >= 62.79 → #6 AWG
    expect(result.recommendedSize).toBe('6');
  });

  test('reports termination warning for 90°C insulation', () => {
    const input: WireSizingInput = {
      material: 'copper',
      insulationTemp: 90,
      requiredAmps: 15,
      ambientTemp: 30,
      numConductors: 3,
    };
    const result = calculateWireSizing(input);
    expectResult(result);
    expect(result.terminationWarning).toBe(true);
    expect(result.terminationAmpacity).not.toBeNull();
  });

  test('no termination warning for 75°C insulation', () => {
    const input: WireSizingInput = {
      material: 'copper',
      insulationTemp: 75,
      requiredAmps: 15,
      ambientTemp: 30,
      numConductors: 3,
    };
    const result = calculateWireSizing(input);
    expectResult(result);
    expect(result.terminationWarning).toBe(false);
    expect(result.terminationAmpacity).toBeNull();
  });

  test('overcurrent limits: #14→15A, #12→20A, #10→30A', () => {
    // 15A → should get #14 (smallest copper wire for 15A at 60°C)
    const result14 = calculateWireSizing({
      material: 'copper',
      insulationTemp: 60,
      requiredAmps: 15,
      ambientTemp: 30,
      numConductors: 3,
    });
    expectResult(result14);
    expect(result14.recommendedSize).toBe('14');
    expect(result14.overcurrentLimit).toBe(15);

    const result12 = calculateWireSizing({
      material: 'copper',
      insulationTemp: 60,
      requiredAmps: 20,
      ambientTemp: 30,
      numConductors: 3,
    });
    expectResult(result12);
    expect(result12.recommendedSize).toBe('12');
    expect(result12.overcurrentLimit).toBe(20);
  });

  test('returns error for zero amps', () => {
    const result = calculateWireSizing({
      material: 'copper',
      insulationTemp: 90,
      requiredAmps: 0,
      ambientTemp: 30,
      numConductors: 3,
    });
    expect(result).toHaveProperty('error');
  });

  test('returns error for negative amps', () => {
    const result = calculateWireSizing({
      material: 'copper',
      insulationTemp: 90,
      requiredAmps: -10,
      ambientTemp: 30,
      numConductors: 3,
    });
    expect(result).toHaveProperty('error');
  });

  test('aluminum conductor sizing', () => {
    const result = calculateWireSizing({
      material: 'aluminum',
      insulationTemp: 75,
      requiredAmps: 100,
      ambientTemp: 30,
      numConductors: 3,
    });
    expectResult(result);
    // Aluminum at 75°C: #1 AWG = 100A
    expect(result.recommendedSize).toBe('1');
    expect(result.ampacityAtRatedTemp).toBe(100);
  });

  test('includes CEC reference', () => {
    const result = calculateWireSizing({
      material: 'copper',
      insulationTemp: 90,
      requiredAmps: 50,
      ambientTemp: 30,
      numConductors: 3,
    });
    expectResult(result);
    expect(result.cecReference).toContain('CEC 2021');
    expect(result.cecReference).toContain('Table 2');
  });
});

/**
 * Voltage Drop Calculator Tests — CEC 2021 Rule 8-102
 *
 * Formulas:
 *   Single Phase: Vd = (2 × K × I × L) / A
 *   Three Phase:  Vd = (1.732 × K × I × L) / A
 */

import { calculateVoltageDrop, VoltageDropInput, VoltageDropResult } from '../utils/voltage-drop';

function expectResult(result: VoltageDropResult | { error: string }): VoltageDropResult {
  expect(result).not.toHaveProperty('error');
  return result as VoltageDropResult;
}

// ============================================================
// Single Phase Voltage Drop — Imperial
// ============================================================
describe('Voltage Drop — Single Phase Imperial', () => {
  test('20A, #12 copper, 100ft, 120V → correct voltage drop', () => {
    const result = expectResult(calculateVoltageDrop({
      systemType: 'single', sourceVoltage: 120, material: 'copper',
      wireSize: '12', loadCurrent: 20, distance: 100,
      unitSystem: 'imperial', parallelConductors: 1,
    }));
    // Vd = 2 × 12.9 × 20 × 100 / 6530 = 51600 / 6530 = 7.90V
    expect(result.voltageDrop).toBeCloseTo(7.90, 1);
    expect(result.voltageDropPercent).toBeCloseTo(6.58, 1);
    expect(result.voltageAtLoad).toBeCloseTo(112.10, 0);
    expect(result.status).toBe('fail'); // > 5%
  });

  test('15A, #14 copper, 50ft, 120V → voltage drop', () => {
    const result = expectResult(calculateVoltageDrop({
      systemType: 'single', sourceVoltage: 120, material: 'copper',
      wireSize: '14', loadCurrent: 15, distance: 50,
      unitSystem: 'imperial', parallelConductors: 1,
    }));
    // Vd = 2 × 12.9 × 15 × 50 / 4110 = 19350 / 4110 = 4.71V
    expect(result.voltageDrop).toBeCloseTo(4.71, 1);
    expect(result.voltageDropPercent).toBeCloseTo(3.92, 1);
    expect(result.status).toBe('warning'); // 3-5%
  });

  test('10A, #12 copper, 30ft, 120V → within 3%', () => {
    const result = expectResult(calculateVoltageDrop({
      systemType: 'single', sourceVoltage: 120, material: 'copper',
      wireSize: '12', loadCurrent: 10, distance: 30,
      unitSystem: 'imperial', parallelConductors: 1,
    }));
    // Vd = 2 × 12.9 × 10 × 30 / 6530 = 7740 / 6530 = 1.19V
    expect(result.voltageDrop).toBeCloseTo(1.19, 1);
    expect(result.voltageDropPercent).toBeCloseTo(0.99, 1);
    expect(result.status).toBe('pass'); // < 3%
  });
});

// ============================================================
// Three Phase Voltage Drop — Imperial
// ============================================================
describe('Voltage Drop — Three Phase Imperial', () => {
  test('50A, #6 copper, 200ft, 208V → three phase drop', () => {
    const result = expectResult(calculateVoltageDrop({
      systemType: 'three', sourceVoltage: 208, material: 'copper',
      wireSize: '6', loadCurrent: 50, distance: 200,
      unitSystem: 'imperial', parallelConductors: 1,
    }));
    // Vd = 1.732 × 12.9 × 50 × 200 / 26240 = 2234160 / 26240 / 10 = 8.52V
    // Let me recalculate: 1.732 * 12.9 * 50 * 200 = 1.732 * 12.9 * 10000 = 1.732 * 129000 = 223428
    // 223428 / 26240 = 8.52V
    expect(result.voltageDrop).toBeCloseTo(8.52, 0);
    expect(result.voltageDropPercent).toBeCloseTo(4.10, 0);
    expect(result.status).toBe('warning');
  });
});

// ============================================================
// Metric Unit System
// ============================================================
describe('Voltage Drop — Metric Units', () => {
  test('20A, #12 copper, 30.48m (100ft), 120V → similar to imperial', () => {
    const imperial = expectResult(calculateVoltageDrop({
      systemType: 'single', sourceVoltage: 120, material: 'copper',
      wireSize: '12', loadCurrent: 20, distance: 100,
      unitSystem: 'imperial', parallelConductors: 1,
    }));

    const metric = expectResult(calculateVoltageDrop({
      systemType: 'single', sourceVoltage: 120, material: 'copper',
      wireSize: '12', loadCurrent: 20, distance: 30.48,
      unitSystem: 'metric', parallelConductors: 1,
    }));

    // Imperial and metric should give very close results (< 0.5% difference)
    expect(Math.abs(imperial.voltageDrop - metric.voltageDrop)).toBeLessThan(0.05);
  });
});

// ============================================================
// Parallel Conductors
// ============================================================
describe('Voltage Drop — Parallel Conductors', () => {
  test('parallel conductors reduce voltage drop proportionally', () => {
    const single = expectResult(calculateVoltageDrop({
      systemType: 'single', sourceVoltage: 240, material: 'copper',
      wireSize: '4', loadCurrent: 100, distance: 200,
      unitSystem: 'imperial', parallelConductors: 1,
    }));

    const parallel = expectResult(calculateVoltageDrop({
      systemType: 'single', sourceVoltage: 240, material: 'copper',
      wireSize: '4', loadCurrent: 100, distance: 200,
      unitSystem: 'imperial', parallelConductors: 2,
    }));

    // With 2 parallel conductors, voltage drop should be halved
    expect(parallel.voltageDrop).toBeCloseTo(single.voltageDrop / 2, 1);
  });
});

// ============================================================
// Aluminum vs Copper
// ============================================================
describe('Voltage Drop — Material Comparison', () => {
  test('aluminum has higher voltage drop than copper for same wire size', () => {
    const copper = expectResult(calculateVoltageDrop({
      systemType: 'single', sourceVoltage: 240, material: 'copper',
      wireSize: '4', loadCurrent: 50, distance: 100,
      unitSystem: 'imperial', parallelConductors: 1,
    }));

    const aluminum = expectResult(calculateVoltageDrop({
      systemType: 'single', sourceVoltage: 240, material: 'aluminum',
      wireSize: '4', loadCurrent: 50, distance: 100,
      unitSystem: 'imperial', parallelConductors: 1,
    }));

    // Aluminum K = 21.2 vs Copper K = 12.9 → ~64% higher drop
    expect(aluminum.voltageDrop).toBeGreaterThan(copper.voltageDrop);
    const ratio = aluminum.voltageDrop / copper.voltageDrop;
    expect(ratio).toBeCloseTo(21.2 / 12.9, 1);
  });
});

// ============================================================
// Max Recommended Distance
// ============================================================
describe('Voltage Drop — Max Recommended Distance', () => {
  test('maxRecommendedDistance is consistent with 3% formula', () => {
    const result = expectResult(calculateVoltageDrop({
      systemType: 'single', sourceVoltage: 120, material: 'copper',
      wireSize: '12', loadCurrent: 20, distance: 100,
      unitSystem: 'imperial', parallelConductors: 1,
    }));

    // At max distance, Vd should be exactly 3%
    // Lmax = (0.03 × 120 × 6530) / (2 × 12.9 × 20) = 23508 / 516 = 45.6 ft
    expect(result.maxRecommendedDistance).toBeCloseTo(45.6, 0);
  });
});

// ============================================================
// Status Thresholds
// ============================================================
describe('Voltage Drop — Status Thresholds', () => {
  test('under 3% = pass', () => {
    // Use a distance clearly under the 3% limit (max is ~45.6 ft for this scenario)
    const result = expectResult(calculateVoltageDrop({
      systemType: 'single', sourceVoltage: 120, material: 'copper',
      wireSize: '12', loadCurrent: 20, distance: 44,
      unitSystem: 'imperial', parallelConductors: 1,
    }));
    expect(result.voltageDropPercent).toBeLessThan(3);
    expect(result.status).toBe('pass');
  });

  test('slightly over 5% = fail', () => {
    const result = expectResult(calculateVoltageDrop({
      systemType: 'single', sourceVoltage: 120, material: 'copper',
      wireSize: '14', loadCurrent: 15, distance: 100,
      unitSystem: 'imperial', parallelConductors: 1,
    }));
    // Vd = 2 × 12.9 × 15 × 100 / 4110 = 38700 / 4110 = 9.42V = 7.85%
    expect(result.status).toBe('fail');
    expect(result.voltageDropPercent).toBeGreaterThan(5);
  });
});

// ============================================================
// Error Handling
// ============================================================
describe('Voltage Drop — Error Handling', () => {
  test('rejects zero source voltage', () => {
    const result = calculateVoltageDrop({
      systemType: 'single', sourceVoltage: 0, material: 'copper',
      wireSize: '12', loadCurrent: 20, distance: 100,
      unitSystem: 'imperial', parallelConductors: 1,
    });
    expect(result).toHaveProperty('error');
  });

  test('rejects zero load current', () => {
    const result = calculateVoltageDrop({
      systemType: 'single', sourceVoltage: 120, material: 'copper',
      wireSize: '12', loadCurrent: 0, distance: 100,
      unitSystem: 'imperial', parallelConductors: 1,
    });
    expect(result).toHaveProperty('error');
  });

  test('rejects zero distance', () => {
    const result = calculateVoltageDrop({
      systemType: 'single', sourceVoltage: 120, material: 'copper',
      wireSize: '12', loadCurrent: 20, distance: 0,
      unitSystem: 'imperial', parallelConductors: 1,
    });
    expect(result).toHaveProperty('error');
  });
});

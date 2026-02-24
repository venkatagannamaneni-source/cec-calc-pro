/**
 * Conduit Fill Calculator Tests — CEC 2021 Rule 12-910, Tables 6/8/9
 */

import { calculateConduitFill, ConduitFillInput, ConduitFillResult } from '../utils/conduit-fill';
import { getMaxFillPercent } from '../data/conduit-data';

function expectResult(result: ConduitFillResult | { error: string }): ConduitFillResult {
  expect(result).not.toHaveProperty('error');
  return result as ConduitFillResult;
}

// ============================================================
// CEC Table 8 — Fill Percentages
// ============================================================
describe('CEC Table 8 — Max Fill Percentages', () => {
  test('1 conductor = 53% fill', () => {
    expect(getMaxFillPercent(1)).toBe(53);
  });

  test('2 conductors = 31% fill', () => {
    expect(getMaxFillPercent(2)).toBe(31);
  });

  test('3 or more conductors = 40% fill', () => {
    expect(getMaxFillPercent(3)).toBe(40);
    expect(getMaxFillPercent(10)).toBe(40);
    expect(getMaxFillPercent(100)).toBe(40);
  });
});

// ============================================================
// README Test Case: 3× #10 RW90XLPE in 1/2" EMT
// ============================================================
describe('Conduit Fill — README Test Case', () => {
  test('3× #10 RW90XLPE in 1/2" EMT', () => {
    const result = expectResult(calculateConduitFill({
      conduitType: 'EMT',
      tradeSize: '1/2"',
      wires: [{ wireSize: '10', insulationType: 'RW90 XLPE', quantity: 3 }],
    }));

    // Wire area: #10 RW90 XLPE = 24.52 mm² each
    // Total wire area: 3 × 24.52 = 73.56 mm²
    expect(result.totalWireArea).toBeCloseTo(73.56, 1);

    // Conduit area: 1/2" EMT = 161 mm²
    expect(result.conduitArea).toBe(161);

    // Fill %: 73.56 / 161 × 100 = 45.69%
    expect(result.fillPercent).toBeCloseTo(45.69, 0);

    // 3 conductors → max fill = 40%
    expect(result.maxFillPercent).toBe(40);
    expect(result.totalConductors).toBe(3);

    // 45.69% > 40% → FAIL
    expect(result.status).toBe('fail');
  });
});

// ============================================================
// Basic Fill Calculations
// ============================================================
describe('Conduit Fill — Basic Calculations', () => {
  test('single conductor in large conduit passes', () => {
    const result = expectResult(calculateConduitFill({
      conduitType: 'EMT',
      tradeSize: '2"',
      wires: [{ wireSize: '14', insulationType: 'T90 Nylon', quantity: 1 }],
    }));

    // Wire area: #14 T90 Nylon = 8.97 mm²
    // Conduit area: 2" EMT = 1534 mm²
    // Fill: 8.97 / 1534 × 100 = 0.58%
    // 1 conductor → max 53%
    expect(result.status).toBe('pass');
    expect(result.fillPercent).toBeLessThan(1);
  });

  test('multiple wire sizes combined correctly', () => {
    const result = expectResult(calculateConduitFill({
      conduitType: 'EMT',
      tradeSize: '1"',
      wires: [
        { wireSize: '12', insulationType: 'RW90 XLPE', quantity: 3 },
        { wireSize: '10', insulationType: 'RW90 XLPE', quantity: 2 },
      ],
    }));

    // Wire area: 3×17.34 + 2×24.52 = 52.02 + 49.04 = 101.06 mm²
    expect(result.totalWireArea).toBeCloseTo(101.06, 1);
    expect(result.totalConductors).toBe(5);

    // Conduit area: 1" EMT = 490 mm²
    // Fill: 101.06 / 490 × 100 = 20.62%
    // 5 conductors → max 40%
    expect(result.maxFillPercent).toBe(40);
    expect(result.status).toBe('pass');
  });

  test('remaining capacity is calculated correctly', () => {
    const result = expectResult(calculateConduitFill({
      conduitType: 'EMT',
      tradeSize: '1"',
      wires: [{ wireSize: '12', insulationType: 'RW90 XLPE', quantity: 4 }],
    }));

    // Wire area: 4 × 17.34 = 69.36 mm²
    // Conduit: 490 mm², max fill 40% → allowed area = 196 mm²
    // Remaining: 196 - 69.36 = 126.64 mm²
    expect(result.remainingCapacity).toBeCloseTo(126.64, 0);
  });
});

// ============================================================
// Different Conduit Types
// ============================================================
describe('Conduit Fill — Conduit Types', () => {
  test('Rigid PVC has smaller area than EMT for same trade size', () => {
    const emtResult = expectResult(calculateConduitFill({
      conduitType: 'EMT',
      tradeSize: '1/2"',
      wires: [{ wireSize: '14', insulationType: 'T90 Nylon', quantity: 3 }],
    }));

    const pvcResult = expectResult(calculateConduitFill({
      conduitType: 'Rigid PVC',
      tradeSize: '1/2"',
      wires: [{ wireSize: '14', insulationType: 'T90 Nylon', quantity: 3 }],
    }));

    // PVC has smaller internal area → higher fill %
    expect(pvcResult.fillPercent).toBeGreaterThan(emtResult.fillPercent);
    expect(pvcResult.conduitArea).toBeLessThan(emtResult.conduitArea);
  });
});

// ============================================================
// Error Handling
// ============================================================
describe('Conduit Fill — Error Handling', () => {
  test('rejects empty wire list', () => {
    const result = calculateConduitFill({
      conduitType: 'EMT', tradeSize: '1"', wires: [],
    });
    expect(result).toHaveProperty('error');
  });

  test('rejects all-zero quantities', () => {
    const result = calculateConduitFill({
      conduitType: 'EMT', tradeSize: '1"',
      wires: [{ wireSize: '12', insulationType: 'RW90 XLPE', quantity: 0 }],
    });
    expect(result).toHaveProperty('error');
  });
});

/**
 * Conduit Fill Calculator Tests — CEC 2021 Rule 12-910, Tables 8/9/10A
 *
 * Wire areas from CEC Table 10A (verified against IAEI, ebmag, ServiceWire OD data).
 * Conduit areas from CEC Table 9 / ANSI standard dimensions.
 * Fill percentages from CEC Table 8.
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

    // Wire area: #10 RW90 XLPE = 15.69 mm² each (CEC Table 10A)
    // Total wire area: 3 × 15.69 = 47.07 mm²
    expect(result.totalWireArea).toBeCloseTo(47.07, 1);

    // Conduit area: 1/2" EMT = 196 mm² (ANSI C80.3 nominal)
    expect(result.conduitArea).toBe(196);

    // Fill %: 47.07 / 196 × 100 = 24.01%
    expect(result.fillPercent).toBeCloseTo(24.01, 0);

    // 3 conductors → max fill = 40%
    expect(result.maxFillPercent).toBe(40);
    expect(result.totalConductors).toBe(3);

    // 24.01% < 40% → PASS (per CEC 2021, 3× #10 RW90XLPE fits in 1/2" EMT)
    expect(result.status).toBe('pass');
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
    // Conduit area: 2" EMT = 2165 mm²
    // Fill: 8.97 / 2165 × 100 = 0.41%
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

    // Wire area: 3×11.58 + 2×15.69 = 34.74 + 31.38 = 66.12 mm²
    expect(result.totalWireArea).toBeCloseTo(66.12, 1);
    expect(result.totalConductors).toBe(5);

    // Conduit area: 1" EMT = 557 mm²
    // Fill: 66.12 / 557 × 100 = 11.87%
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

    // Wire area: 4 × 11.58 = 46.32 mm²
    // Conduit: 557 mm², max fill 40% → allowed area = 222.8 mm²
    // Remaining: 222.8 - 46.32 = 176.48 mm²
    expect(result.remainingCapacity).toBeCloseTo(176.48, 0);
  });
});

// ============================================================
// Different Conduit Types
// ============================================================
describe('Conduit Fill — Conduit Types', () => {
  test('Rigid PVC has smaller area than Rigid Metal for same trade size', () => {
    const rigidResult = expectResult(calculateConduitFill({
      conduitType: 'Rigid Metal',
      tradeSize: '1/2"',
      wires: [{ wireSize: '14', insulationType: 'T90 Nylon', quantity: 3 }],
    }));

    const pvcResult = expectResult(calculateConduitFill({
      conduitType: 'Rigid PVC',
      tradeSize: '1/2"',
      wires: [{ wireSize: '14', insulationType: 'T90 Nylon', quantity: 3 }],
    }));

    // PVC has smaller internal area → higher fill %
    expect(pvcResult.fillPercent).toBeGreaterThan(rigidResult.fillPercent);
    expect(pvcResult.conduitArea).toBeLessThan(rigidResult.conduitArea);
  });

  test('Rigid Metal has larger area than EMT for same trade size', () => {
    const emtResult = expectResult(calculateConduitFill({
      conduitType: 'EMT',
      tradeSize: '1/2"',
      wires: [{ wireSize: '14', insulationType: 'T90 Nylon', quantity: 3 }],
    }));

    const rigidResult = expectResult(calculateConduitFill({
      conduitType: 'Rigid Metal',
      tradeSize: '1/2"',
      wires: [{ wireSize: '14', insulationType: 'T90 Nylon', quantity: 3 }],
    }));

    // Rigid Metal has larger internal area than EMT
    expect(rigidResult.conduitArea).toBeGreaterThan(emtResult.conduitArea);
    expect(rigidResult.fillPercent).toBeLessThan(emtResult.fillPercent);
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

import { calculateConduitFill, ConduitFillInput, ConduitFillResult } from '../../utils/conduit-fill';
import { getMaxFillPercent, conduitAreas, wireInsulationAreas } from '../../data/conduit-data';

function expectResult(result: ConduitFillResult | { error: string }): asserts result is ConduitFillResult {
  expect(result).not.toHaveProperty('error');
}

describe('getMaxFillPercent (CEC Table 8)', () => {
  test('1 conductor → 53%', () => {
    expect(getMaxFillPercent(1)).toBe(53);
  });

  test('2 conductors → 31%', () => {
    expect(getMaxFillPercent(2)).toBe(31);
  });

  test('3+ conductors → 40%', () => {
    expect(getMaxFillPercent(3)).toBe(40);
    expect(getMaxFillPercent(10)).toBe(40);
    expect(getMaxFillPercent(100)).toBe(40);
  });
});

describe('calculateConduitFill', () => {
  test('CEC verification: 3× #10 RW90 XLPE in 1/2" EMT', () => {
    // Wire area: #10 RW90 XLPE = 24.52 mm² each
    // Conduit area: 1/2" EMT = 161 mm²
    // Total wire area: 3 × 24.52 = 73.56 mm²
    // Fill: 73.56 / 161 × 100 = 45.69%
    // Max fill for 3 conductors: 40%
    // Status: fail
    const input: ConduitFillInput = {
      conduitType: 'EMT',
      tradeSize: '1/2"',
      wires: [{ wireSize: '10', insulationType: 'RW90 XLPE', quantity: 3 }],
    };
    const result = calculateConduitFill(input);
    expectResult(result);

    expect(result.totalWireArea).toBeCloseTo(73.56, 1);
    expect(result.conduitArea).toBe(161);
    expect(result.fillPercent).toBeCloseTo(45.69, 0);
    expect(result.maxFillPercent).toBe(40);
    expect(result.status).toBe('fail');
    expect(result.totalConductors).toBe(3);
  });

  test('single conductor uses 53% fill limit', () => {
    const input: ConduitFillInput = {
      conduitType: 'EMT',
      tradeSize: '1"',
      wires: [{ wireSize: '4/0', insulationType: 'RW90 XLPE', quantity: 1 }],
    };
    const result = calculateConduitFill(input);
    expectResult(result);
    expect(result.maxFillPercent).toBe(53);
    // #4/0 RW90 XLPE = 180.7 mm², 1" EMT = 490 mm²
    // 180.7/490*100 = 36.88% → pass (< 53%)
    expect(result.status).toBe('pass');
  });

  test('two conductors use 31% fill limit', () => {
    const input: ConduitFillInput = {
      conduitType: 'EMT',
      tradeSize: '3/4"',
      wires: [{ wireSize: '12', insulationType: 'T90 Nylon', quantity: 2 }],
    };
    const result = calculateConduitFill(input);
    expectResult(result);
    expect(result.maxFillPercent).toBe(31);
    // 2 × 11.68 = 23.36 mm², 3/4" EMT = 283 mm²
    // 23.36/283*100 = 8.25% → pass
    expect(result.status).toBe('pass');
  });

  test('mixed wire sizes and insulation types', () => {
    const input: ConduitFillInput = {
      conduitType: 'EMT',
      tradeSize: '1"',
      wires: [
        { wireSize: '12', insulationType: 'T90 Nylon', quantity: 3 },
        { wireSize: '10', insulationType: 'RW90 XLPE', quantity: 2 },
      ],
    };
    const result = calculateConduitFill(input);
    expectResult(result);
    expect(result.totalConductors).toBe(5);
    expect(result.maxFillPercent).toBe(40); // 5 conductors → 40%
    // Wire area: 3×11.68 + 2×24.52 = 35.04 + 49.04 = 84.08
    expect(result.totalWireArea).toBeCloseTo(84.08, 1);
  });

  test('remaining capacity is calculated correctly', () => {
    const input: ConduitFillInput = {
      conduitType: 'EMT',
      tradeSize: '2"',
      wires: [{ wireSize: '12', insulationType: 'T90 Nylon', quantity: 3 }],
    };
    const result = calculateConduitFill(input);
    expectResult(result);
    // 2" EMT = 1534 mm², max fill 40% = 613.6 mm²
    // Wire area = 3 × 11.68 = 35.04
    // Remaining = 613.6 - 35.04 = 578.56
    expect(result.remainingCapacity).toBeCloseTo(578.56, 0);
  });

  test('Rigid PVC conduit uses correct areas', () => {
    const input: ConduitFillInput = {
      conduitType: 'Rigid PVC',
      tradeSize: '1/2"',
      wires: [{ wireSize: '14', insulationType: 'T90 Nylon', quantity: 3 }],
    };
    const result = calculateConduitFill(input);
    expectResult(result);
    expect(result.conduitArea).toBe(141); // Rigid PVC 1/2" = 141 mm²
  });

  test('returns error for empty wires array', () => {
    const result = calculateConduitFill({
      conduitType: 'EMT',
      tradeSize: '1/2"',
      wires: [],
    });
    expect(result).toHaveProperty('error');
  });

  test('returns error for zero quantity wires only', () => {
    const result = calculateConduitFill({
      conduitType: 'EMT',
      tradeSize: '1/2"',
      wires: [{ wireSize: '12', insulationType: 'T90 Nylon', quantity: 0 }],
    });
    expect(result).toHaveProperty('error');
  });

  test('includes CEC reference', () => {
    const input: ConduitFillInput = {
      conduitType: 'EMT',
      tradeSize: '1"',
      wires: [{ wireSize: '12', insulationType: 'T90 Nylon', quantity: 3 }],
    };
    const result = calculateConduitFill(input);
    expectResult(result);
    expect(result.cecReference).toContain('CEC 2021');
    expect(result.cecReference).toContain('Rule 12-910');
  });
});

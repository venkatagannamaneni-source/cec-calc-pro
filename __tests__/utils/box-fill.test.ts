import { calculateBoxFill, BoxFillInput, BoxFillResult } from '../../utils/box-fill';
import { volumePerConductor, standardBoxes } from '../../data/box-fill-data';

describe('CEC Table 22 volumes', () => {
  test('#14 → 24.6 mL', () => expect(volumePerConductor['14']).toBe(24.6));
  test('#12 → 28.7 mL', () => expect(volumePerConductor['12']).toBe(28.7));
  test('#10 → 36.9 mL', () => expect(volumePerConductor['10']).toBe(36.9));
  test('#8 → 45.1 mL', () => expect(volumePerConductor['8']).toBe(45.1));
  test('#6 → 73.7 mL', () => expect(volumePerConductor['6']).toBe(73.7));
});

describe('calculateBoxFill', () => {
  const emptyInput: BoxFillInput = {
    wires: [],
    wireConnectorPairs: 0,
    largestConnectorWire: '12',
    devices: 0,
    largestDeviceWire: '12',
    fixtureStuds: 0,
    largestStudWire: '12',
    hasEGC: false,
    largestEGCWire: '14',
    hasDeepDevice: false,
    deepDeviceDepthCm: 0,
  };

  test('CEC verification: 6× #12-2C + 3 marrette pairs → 430.5 mL', () => {
    // 6 cables of #12-2C = 12 insulated #12 conductors
    // 3 marrette pairs (wire connectors) based on largest wire #12
    // Volume: 12 × 28.7 + 3 × 28.7 = 344.4 + 86.1 = 430.5 mL
    const input: BoxFillInput = {
      ...emptyInput,
      wires: [{ wireSize: '12', insulatedWires: 12, passThroughWires: 0 }],
      wireConnectorPairs: 3,
      largestConnectorWire: '12',
    };
    const result = calculateBoxFill(input);
    expect(result.totalRequiredVolume).toBe(430.5);
  });

  test('pass-through wires count as 1 each (not 2)', () => {
    // CEC rule: pass-through conductors count as 1 conductor
    const input: BoxFillInput = {
      ...emptyInput,
      wires: [{ wireSize: '12', insulatedWires: 0, passThroughWires: 2 }],
    };
    const result = calculateBoxFill(input);
    // 2 pass-through × 28.7 = 57.4 mL (not 4 × 28.7)
    expect(result.totalRequiredVolume).toBe(57.4);
  });

  test('EGCs count as 1 conductor total (based on largest)', () => {
    const input: BoxFillInput = {
      ...emptyInput,
      hasEGC: true,
      largestEGCWire: '12',
    };
    const result = calculateBoxFill(input);
    // 1 × 28.7 = 28.7 mL regardless of how many EGCs
    expect(result.totalRequiredVolume).toBe(28.7);

    const breakdown = result.breakdown.find((b) => b.description.includes('grounding'));
    expect(breakdown).toBeDefined();
    expect(breakdown!.count).toBe(1);
  });

  test('devices count as 2 conductor volumes each', () => {
    const input: BoxFillInput = {
      ...emptyInput,
      devices: 2,
      largestDeviceWire: '12',
    };
    const result = calculateBoxFill(input);
    // 2 devices × 2 × 28.7 = 114.8 mL
    expect(result.totalRequiredVolume).toBe(114.8);
  });

  test('wire connector pairs use 1 volume each based on largest wire', () => {
    const input: BoxFillInput = {
      ...emptyInput,
      wireConnectorPairs: 3,
      largestConnectorWire: '10',
    };
    const result = calculateBoxFill(input);
    // 3 × 36.9 = 110.7 mL
    expect(result.totalRequiredVolume).toBe(110.7);
  });

  test('fixture studs use 1 volume each', () => {
    const input: BoxFillInput = {
      ...emptyInput,
      fixtureStuds: 2,
      largestStudWire: '14',
    };
    const result = calculateBoxFill(input);
    // 2 × 24.6 = 49.2 mL
    expect(result.totalRequiredVolume).toBe(49.2);
  });

  test('deep device reduction applied when depth > 2.54 cm', () => {
    const input: BoxFillInput = {
      ...emptyInput,
      wires: [{ wireSize: '12', insulatedWires: 6, passThroughWires: 0 }],
      hasDeepDevice: true,
      deepDeviceDepthCm: 5.08, // 2 inches
    };
    const result = calculateBoxFill(input);
    expect(result.deepDeviceReduction).toBeGreaterThan(0);
    // Reduction = (82 × 5.08) / 2.54 = 164 mL
    expect(result.deepDeviceReduction).toBeCloseTo(164, 0);
  });

  test('no deep device reduction when depth ≤ 2.54 cm', () => {
    const input: BoxFillInput = {
      ...emptyInput,
      wires: [{ wireSize: '12', insulatedWires: 6, passThroughWires: 0 }],
      hasDeepDevice: true,
      deepDeviceDepthCm: 2.54,
    };
    const result = calculateBoxFill(input);
    expect(result.deepDeviceReduction).toBe(0);
  });

  test('suitable boxes are those with enough volume', () => {
    const input: BoxFillInput = {
      ...emptyInput,
      wires: [{ wireSize: '12', insulatedWires: 4, passThroughWires: 0 }],
    };
    const result = calculateBoxFill(input);
    // 4 × 28.7 = 114.8 mL
    expect(result.totalRequiredVolume).toBe(114.8);
    // All standard boxes with volume >= 114.8 should be listed
    expect(result.suitableBoxes.length).toBeGreaterThan(0);
    result.suitableBoxes.forEach((box) => {
      expect(box.volume).toBeGreaterThanOrEqual(result.totalRequiredVolume);
    });
  });

  test('mixed wire sizes sum correctly', () => {
    const input: BoxFillInput = {
      ...emptyInput,
      wires: [
        { wireSize: '14', insulatedWires: 3, passThroughWires: 0 },
        { wireSize: '12', insulatedWires: 2, passThroughWires: 1 },
      ],
    };
    const result = calculateBoxFill(input);
    // 3 × 24.6 + 3 × 28.7 = 73.8 + 86.1 = 159.9 mL
    expect(result.totalRequiredVolume).toBe(159.9);
  });

  test('breakdown items are generated for each component', () => {
    const input: BoxFillInput = {
      ...emptyInput,
      wires: [{ wireSize: '12', insulatedWires: 4, passThroughWires: 0 }],
      wireConnectorPairs: 2,
      largestConnectorWire: '12',
      devices: 1,
      largestDeviceWire: '12',
      hasEGC: true,
      largestEGCWire: '14',
    };
    const result = calculateBoxFill(input);
    // Should have 4 breakdown items: conductors, connectors, devices, EGC
    expect(result.breakdown.length).toBe(4);
  });

  test('empty box (no wires) returns 0 volume', () => {
    const result = calculateBoxFill(emptyInput);
    expect(result.totalRequiredVolume).toBe(0);
    expect(result.breakdown.length).toBe(0);
  });

  test('includes CEC reference', () => {
    const result = calculateBoxFill(emptyInput);
    expect(result.cecReference).toContain('CEC 2021');
    expect(result.cecReference).toContain('Rule 12-3034');
    expect(result.cecReference).toContain('Table 22');
  });
});

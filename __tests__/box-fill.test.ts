/**
 * Box Fill Calculator Tests — CEC 2021 Rule 12-3034, Table 22
 *
 * CRITICAL: CEC uses Table 22 (metric mL/cm³), NOT NEC Table 314.16(B).
 * These tests verify CEC-specific counting rules.
 */

import { calculateBoxFill, BoxFillInput, BoxFillResult } from '../utils/box-fill';
import { volumePerConductor } from '../data/box-fill-data';

// ============================================================
// CEC Table 22 — Volume Per Conductor Values
// ============================================================
describe('CEC Table 22 — Volume Per Conductor', () => {
  test('#14 AWG = 24.6 mL (NOT NEC 32.8 cm³)', () => {
    expect(volumePerConductor['14']).toBe(24.6);
  });

  test('#12 AWG = 28.7 mL', () => {
    expect(volumePerConductor['12']).toBe(28.7);
  });

  test('#10 AWG = 36.9 mL', () => {
    expect(volumePerConductor['10']).toBe(36.9);
  });

  test('#8 AWG = 45.1 mL', () => {
    expect(volumePerConductor['8']).toBe(45.1);
  });

  test('#6 AWG = 73.7 mL', () => {
    expect(volumePerConductor['6']).toBe(73.7);
  });
});

// ============================================================
// README Test Case: 6× #12-2C + 3 marrette pairs = 430.5 mL
// ============================================================
describe('Box Fill — README Test Case', () => {
  test('6× #12-2C + 3 marrette pairs → 12 × 28.7 + 3 × 28.7 = 430.5 mL', () => {
    const result = calculateBoxFill({
      wires: [
        { wireSize: '12', insulatedWires: 12, passThroughWires: 0 },
        { wireSize: '14', insulatedWires: 0, passThroughWires: 0 },
        { wireSize: '10', insulatedWires: 0, passThroughWires: 0 },
        { wireSize: '8', insulatedWires: 0, passThroughWires: 0 },
        { wireSize: '6', insulatedWires: 0, passThroughWires: 0 },
      ],
      wireConnectorPairs: 3,
      largestConnectorWire: '12',
      devices: 0,
      largestDeviceWire: '12',
      fixtureStuds: 0,
      largestStudWire: '12',
      hasEGC: false,
      largestEGCWire: '14',
      hasDeepDevice: false,
      deepDeviceDepthCm: 0,
    });

    // 12 × 28.7 = 344.4 mL (conductors)
    // 3 × 28.7 = 86.1 mL (connector pairs)
    // Total = 430.5 mL
    expect(result.totalRequiredVolume).toBeCloseTo(430.5, 1);
  });
});

// ============================================================
// CEC Counting Rules
// ============================================================
describe('Box Fill — CEC Counting Rules', () => {
  test('pass-through conductors count as 1 each (not 2)', () => {
    const withPassThrough = calculateBoxFill({
      wires: [
        { wireSize: '12', insulatedWires: 0, passThroughWires: 2 },
        { wireSize: '14', insulatedWires: 0, passThroughWires: 0 },
        { wireSize: '10', insulatedWires: 0, passThroughWires: 0 },
        { wireSize: '8', insulatedWires: 0, passThroughWires: 0 },
        { wireSize: '6', insulatedWires: 0, passThroughWires: 0 },
      ],
      wireConnectorPairs: 0, largestConnectorWire: '12',
      devices: 0, largestDeviceWire: '12',
      fixtureStuds: 0, largestStudWire: '12',
      hasEGC: false, largestEGCWire: '14',
      hasDeepDevice: false, deepDeviceDepthCm: 0,
    });

    // 2 pass-through × 28.7 = 57.4 mL (NOT 4 × 28.7)
    expect(withPassThrough.totalRequiredVolume).toBeCloseTo(57.4, 1);
  });

  test('devices count as 2 conductor volumes each', () => {
    const result = calculateBoxFill({
      wires: [
        { wireSize: '14', insulatedWires: 0, passThroughWires: 0 },
        { wireSize: '12', insulatedWires: 0, passThroughWires: 0 },
        { wireSize: '10', insulatedWires: 0, passThroughWires: 0 },
        { wireSize: '8', insulatedWires: 0, passThroughWires: 0 },
        { wireSize: '6', insulatedWires: 0, passThroughWires: 0 },
      ],
      wireConnectorPairs: 0, largestConnectorWire: '12',
      devices: 2, largestDeviceWire: '12',
      fixtureStuds: 0, largestStudWire: '12',
      hasEGC: false, largestEGCWire: '14',
      hasDeepDevice: false, deepDeviceDepthCm: 0,
    });

    // 2 devices × 2 × 28.7 = 114.8 mL
    expect(result.totalRequiredVolume).toBeCloseTo(114.8, 1);
  });

  test('ALL EGCs count as 1 conductor (based on largest)', () => {
    const result = calculateBoxFill({
      wires: [
        { wireSize: '14', insulatedWires: 4, passThroughWires: 0 },
        { wireSize: '12', insulatedWires: 2, passThroughWires: 0 },
        { wireSize: '10', insulatedWires: 0, passThroughWires: 0 },
        { wireSize: '8', insulatedWires: 0, passThroughWires: 0 },
        { wireSize: '6', insulatedWires: 0, passThroughWires: 0 },
      ],
      wireConnectorPairs: 0, largestConnectorWire: '12',
      devices: 0, largestDeviceWire: '12',
      fixtureStuds: 0, largestStudWire: '12',
      hasEGC: true, largestEGCWire: '12',
      hasDeepDevice: false, deepDeviceDepthCm: 0,
    });

    // Conductors: 4×24.6 + 2×28.7 = 98.4 + 57.4 = 155.8
    // EGC: 1×28.7 = 28.7
    // Total: 184.5 mL
    expect(result.totalRequiredVolume).toBeCloseTo(184.5, 1);

    // Verify EGC appears as 1 conductor in breakdown
    const egcItem = result.breakdown.find(b => b.description.includes('grounding'));
    expect(egcItem).toBeDefined();
    expect(egcItem!.count).toBe(1);
  });

  test('fixture studs count as 1 conductor volume each', () => {
    const result = calculateBoxFill({
      wires: [
        { wireSize: '14', insulatedWires: 0, passThroughWires: 0 },
        { wireSize: '12', insulatedWires: 0, passThroughWires: 0 },
        { wireSize: '10', insulatedWires: 0, passThroughWires: 0 },
        { wireSize: '8', insulatedWires: 0, passThroughWires: 0 },
        { wireSize: '6', insulatedWires: 0, passThroughWires: 0 },
      ],
      wireConnectorPairs: 0, largestConnectorWire: '12',
      devices: 0, largestDeviceWire: '12',
      fixtureStuds: 2, largestStudWire: '14',
      hasEGC: false, largestEGCWire: '14',
      hasDeepDevice: false, deepDeviceDepthCm: 0,
    });

    // 2 studs × 24.6 = 49.2 mL
    expect(result.totalRequiredVolume).toBeCloseTo(49.2, 1);
  });

  test('CEC has NO separate cable clamp allowance', () => {
    // This verifies we DON'T have NEC-style clamp deductions
    const result = calculateBoxFill({
      wires: [
        { wireSize: '12', insulatedWires: 4, passThroughWires: 0 },
        { wireSize: '14', insulatedWires: 0, passThroughWires: 0 },
        { wireSize: '10', insulatedWires: 0, passThroughWires: 0 },
        { wireSize: '8', insulatedWires: 0, passThroughWires: 0 },
        { wireSize: '6', insulatedWires: 0, passThroughWires: 0 },
      ],
      wireConnectorPairs: 0, largestConnectorWire: '12',
      devices: 0, largestDeviceWire: '12',
      fixtureStuds: 0, largestStudWire: '12',
      hasEGC: false, largestEGCWire: '14',
      hasDeepDevice: false, deepDeviceDepthCm: 0,
    });

    // Should be exactly 4 × 28.7 = 114.8 mL with NO clamp allowance
    expect(result.totalRequiredVolume).toBeCloseTo(114.8, 1);
    // Verify no "clamp" breakdown item exists
    const clampItem = result.breakdown.find(b =>
      b.description.toLowerCase().includes('clamp')
    );
    expect(clampItem).toBeUndefined();
  });
});

// ============================================================
// Deep Device Reduction
// ============================================================
describe('Box Fill — Deep Device Reduction', () => {
  test('deep device reduces usable space per CEC formula', () => {
    const result = calculateBoxFill({
      wires: [
        { wireSize: '12', insulatedWires: 4, passThroughWires: 0 },
        { wireSize: '14', insulatedWires: 0, passThroughWires: 0 },
        { wireSize: '10', insulatedWires: 0, passThroughWires: 0 },
        { wireSize: '8', insulatedWires: 0, passThroughWires: 0 },
        { wireSize: '6', insulatedWires: 0, passThroughWires: 0 },
      ],
      wireConnectorPairs: 0, largestConnectorWire: '12',
      devices: 0, largestDeviceWire: '12',
      fixtureStuds: 0, largestStudWire: '12',
      hasEGC: false, largestEGCWire: '14',
      hasDeepDevice: true, deepDeviceDepthCm: 3.5,
    });

    // Reduction: 82 × 3.5 / 2.54 = 112.99 mL
    expect(result.deepDeviceReduction).toBeCloseTo(113.0, 0);
  });

  test('no reduction if depth <= 2.54cm (1 inch)', () => {
    const result = calculateBoxFill({
      wires: [
        { wireSize: '12', insulatedWires: 4, passThroughWires: 0 },
        { wireSize: '14', insulatedWires: 0, passThroughWires: 0 },
        { wireSize: '10', insulatedWires: 0, passThroughWires: 0 },
        { wireSize: '8', insulatedWires: 0, passThroughWires: 0 },
        { wireSize: '6', insulatedWires: 0, passThroughWires: 0 },
      ],
      wireConnectorPairs: 0, largestConnectorWire: '12',
      devices: 0, largestDeviceWire: '12',
      fixtureStuds: 0, largestStudWire: '12',
      hasEGC: false, largestEGCWire: '14',
      hasDeepDevice: true, deepDeviceDepthCm: 2.0,
    });

    expect(result.deepDeviceReduction).toBe(0);
  });
});

// ============================================================
// Suitable Box Selection
// ============================================================
describe('Box Fill — Suitable Box Selection', () => {
  test('finds suitable standard boxes for given volume', () => {
    const result = calculateBoxFill({
      wires: [
        { wireSize: '12', insulatedWires: 6, passThroughWires: 0 },
        { wireSize: '14', insulatedWires: 0, passThroughWires: 0 },
        { wireSize: '10', insulatedWires: 0, passThroughWires: 0 },
        { wireSize: '8', insulatedWires: 0, passThroughWires: 0 },
        { wireSize: '6', insulatedWires: 0, passThroughWires: 0 },
      ],
      wireConnectorPairs: 0, largestConnectorWire: '12',
      devices: 0, largestDeviceWire: '12',
      fixtureStuds: 0, largestStudWire: '12',
      hasEGC: false, largestEGCWire: '14',
      hasDeepDevice: false, deepDeviceDepthCm: 0,
    });

    // Total: 6 × 28.7 = 172.2 mL
    expect(result.totalRequiredVolume).toBeCloseTo(172.2, 1);

    // All suggested boxes should have volume >= 172.2 mL
    expect(result.suitableBoxes.length).toBeGreaterThan(0);
    for (const box of result.suitableBoxes) {
      expect(box.volume).toBeGreaterThanOrEqual(result.totalRequiredVolume);
    }
  });
});

// ============================================================
// Complex Real-World Scenario
// ============================================================
describe('Box Fill — Complex Real-World Scenario', () => {
  test('typical receptacle box: 4× #14 + 2× #12 + 1 device + 1 connector pair + EGC', () => {
    const result = calculateBoxFill({
      wires: [
        { wireSize: '14', insulatedWires: 4, passThroughWires: 0 },
        { wireSize: '12', insulatedWires: 2, passThroughWires: 0 },
        { wireSize: '10', insulatedWires: 0, passThroughWires: 0 },
        { wireSize: '8', insulatedWires: 0, passThroughWires: 0 },
        { wireSize: '6', insulatedWires: 0, passThroughWires: 0 },
      ],
      wireConnectorPairs: 1, largestConnectorWire: '12',
      devices: 1, largestDeviceWire: '12',
      fixtureStuds: 0, largestStudWire: '12',
      hasEGC: true, largestEGCWire: '14',
      hasDeepDevice: false, deepDeviceDepthCm: 0,
    });

    // Conductors: 4×24.6 + 2×28.7 = 98.4 + 57.4 = 155.8 mL
    // Connector pairs: 1×28.7 = 28.7 mL
    // Devices: 1×(2×28.7) = 57.4 mL
    // EGC: 1×24.6 = 24.6 mL
    // Total: 155.8 + 28.7 + 57.4 + 24.6 = 266.5 mL
    expect(result.totalRequiredVolume).toBeCloseTo(266.5, 1);
  });
});

// Box Fill Calculator — CEC 2021 Rule 12-3034, Tables 22 & 23
//
// CEC counting rules (differ from NEC):
//   - Insulated conductors: 1 volume each (Table 22)
//   - Pass-through conductors: 1 volume each (not 2)
//   - Wire connector pairs (marrettes): 1 volume each (based on largest wire)
//   - Devices: 2 volumes each (based on largest wire connected)
//   - Fixture studs/hickeys: 1 volume each
//   - EGCs: ALL equipment grounding conductors count as 1 conductor total,
//     based on the volume of the largest EGC present (Rule 12-3034)
//   - CEC does NOT have a separate cable clamp allowance (unlike NEC)
//
// Table 22 values VERIFIED against CEC 2021:
//   ✓ #14=24.6mL, #12=28.7mL, #10=36.9mL, #8=45.1mL, #6=73.7mL
//   (Confirmed via multiple sources including CEC handbook references)
import { BoxFillWireSize, volumePerConductor, standardBoxes, StandardBox } from '../data/box-fill-data';

export interface BoxFillWireEntry {
  wireSize: BoxFillWireSize;
  insulatedWires: number;     // Wires entering the box
  passThroughWires: number;   // Pass-through (count as 1 each, not 2)
}

export interface BoxFillInput {
  wires: BoxFillWireEntry[];
  wireConnectorPairs: number;       // Number of marrette pairs (based on largest wire)
  largestConnectorWire: BoxFillWireSize;
  devices: number;                   // Flush-mounted devices (2 volumes each)
  largestDeviceWire: BoxFillWireSize;
  fixtureStuds: number;             // Fixture studs/hickeys (1 volume each)
  largestStudWire: BoxFillWireSize;
  hasEGC: boolean;                   // Equipment grounding conductors present
  largestEGCWire: BoxFillWireSize;
  hasDeepDevice: boolean;
  deepDeviceDepthCm: number;        // Depth in cm (if > 2.54cm / 1")
  boxVolume?: number;                // Custom box volume in mL (optional)
}

export interface BoxFillBreakdownItem {
  description: string;
  count: number;
  volumeEach: number;
  totalVolume: number;
}

export interface BoxFillResult {
  breakdown: BoxFillBreakdownItem[];
  totalRequiredVolume: number;
  deepDeviceReduction: number;
  effectiveBoxVolume: number | null;
  suitableBoxes: StandardBox[];
  cecReference: string;
}

export function calculateBoxFill(input: BoxFillInput): BoxFillResult {
  const breakdown: BoxFillBreakdownItem[] = [];
  let totalVolume = 0;

  // Count insulated conductors and pass-through wires per size
  for (const wire of input.wires) {
    const volPerConductor = volumePerConductor[wire.wireSize];
    const totalWires = wire.insulatedWires + wire.passThroughWires;
    if (totalWires > 0) {
      const volume = totalWires * volPerConductor;
      breakdown.push({
        description: `#${wire.wireSize} conductors`,
        count: totalWires,
        volumeEach: volPerConductor,
        totalVolume: volume,
      });
      totalVolume += volume;
    }
  }

  // Wire connector pairs (1 volume per pair, based on largest wire)
  if (input.wireConnectorPairs > 0) {
    const volPerConnector = volumePerConductor[input.largestConnectorWire];
    const volume = input.wireConnectorPairs * volPerConnector;
    breakdown.push({
      description: `Wire connector pairs (#${input.largestConnectorWire})`,
      count: input.wireConnectorPairs,
      volumeEach: volPerConnector,
      totalVolume: volume,
    });
    totalVolume += volume;
  }

  // Devices — 2 conductor volumes each, based on largest wire connected
  if (input.devices > 0) {
    const volPerDevice = volumePerConductor[input.largestDeviceWire] * 2;
    const volume = input.devices * volPerDevice;
    breakdown.push({
      description: `Devices (#${input.largestDeviceWire}, 2× each)`,
      count: input.devices,
      volumeEach: volPerDevice,
      totalVolume: volume,
    });
    totalVolume += volume;
  }

  // Fixture studs/hickeys — 1 conductor volume each
  if (input.fixtureStuds > 0) {
    const volPerStud = volumePerConductor[input.largestStudWire];
    const volume = input.fixtureStuds * volPerStud;
    breakdown.push({
      description: `Fixture studs (#${input.largestStudWire})`,
      count: input.fixtureStuds,
      volumeEach: volPerStud,
      totalVolume: volume,
    });
    totalVolume += volume;
  }

  // EGCs — ALL count as 1 conductor, based on largest EGC
  if (input.hasEGC) {
    const volEGC = volumePerConductor[input.largestEGCWire];
    breakdown.push({
      description: `Equipment grounding (#${input.largestEGCWire}, all as 1)`,
      count: 1,
      volumeEach: volEGC,
      totalVolume: volEGC,
    });
    totalVolume += volEGC;
  }

  // Deep device reduction
  let deepDeviceReduction = 0;
  if (input.hasDeepDevice && input.deepDeviceDepthCm > 2.54) {
    deepDeviceReduction = (82 * input.deepDeviceDepthCm) / 2.54;
    deepDeviceReduction = Math.round(deepDeviceReduction * 10) / 10;
  }

  // Total required
  const totalRequired = Math.round(totalVolume * 10) / 10;

  // Find suitable standard boxes
  let effectiveBoxVolume: number | null = null;
  if (input.boxVolume) {
    effectiveBoxVolume = input.boxVolume - deepDeviceReduction;
  }

  const suitableBoxes = standardBoxes.filter(
    (box) => (box.volume - deepDeviceReduction) >= totalRequired,
  );

  return {
    breakdown,
    totalRequiredVolume: totalRequired,
    deepDeviceReduction,
    effectiveBoxVolume,
    suitableBoxes,
    cecReference: 'Per CEC 2021 Rule 12-3034, Table 22',
  };
}

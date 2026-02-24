// Conduit Fill Calculator — CEC 2021 Rule 12-910, Tables 6/8/9
import { WireSize } from '../data/cec-tables';
import {
  ConduitType,
  InsulationType,
  TradeSize,
  conduitAreas,
  wireInsulationAreas,
  getMaxFillPercent,
} from '../data/conduit-data';

export interface WireEntry {
  wireSize: WireSize;
  insulationType: InsulationType;
  quantity: number;
}

export interface ConduitFillInput {
  conduitType: ConduitType;
  tradeSize: TradeSize;
  wires: WireEntry[];
}

export interface ConduitFillResult {
  totalWireArea: number;
  conduitArea: number;
  fillPercent: number;
  maxFillPercent: number;
  status: 'pass' | 'fail';
  remainingCapacity: number;
  totalConductors: number;
  cecReference: string;
}

export function calculateConduitFill(input: ConduitFillInput): ConduitFillResult | { error: string } {
  const { conduitType, tradeSize, wires } = input;

  if (wires.length === 0) {
    return { error: 'At least one wire entry is required' };
  }

  // Get conduit internal area
  const conduitArea = conduitAreas[conduitType]?.[tradeSize];
  if (conduitArea === undefined) {
    return { error: `Conduit area not found for ${conduitType} ${tradeSize}` };
  }

  // Calculate total wire area and conductor count
  let totalWireArea = 0;
  let totalConductors = 0;

  for (const wire of wires) {
    if (wire.quantity <= 0) continue;

    const area = wireInsulationAreas[wire.insulationType]?.[wire.wireSize];
    if (area === undefined) {
      return { error: `Wire area not found for ${wire.wireSize} AWG ${wire.insulationType}` };
    }

    totalWireArea += area * wire.quantity;
    totalConductors += wire.quantity;
  }

  if (totalConductors === 0) {
    return { error: 'Total conductor count must be greater than 0' };
  }

  // Get max fill percentage based on number of conductors (Table 8)
  const maxFillPercent = getMaxFillPercent(totalConductors);

  // Calculate actual fill percentage
  const fillPercent = (totalWireArea / conduitArea) * 100;

  // Determine pass/fail
  const status = fillPercent <= maxFillPercent ? 'pass' : 'fail';

  // Remaining capacity
  const allowedArea = conduitArea * (maxFillPercent / 100);
  const remainingCapacity = allowedArea - totalWireArea;

  return {
    totalWireArea: Math.round(totalWireArea * 100) / 100,
    conduitArea,
    fillPercent: Math.round(fillPercent * 100) / 100,
    maxFillPercent,
    status,
    remainingCapacity: Math.round(remainingCapacity * 100) / 100,
    totalConductors,
    cecReference: 'Per CEC 2021 Rule 12-910, Tables 6/8/9',
  };
}

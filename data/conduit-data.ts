// CEC 2021 Conduit Fill Data
// Tables 6A-6K (wire areas), Table 8 (fill percentages), Tables 9A-9P (conduit areas)
// ⚠️ VERIFICATION REQUIRED: Values are approximations. Verify against actual CEC 2021 tables before publishing.

import { WireSize } from './cec-tables';

export type ConduitType = 'EMT' | 'Rigid PVC' | 'Rigid Metal';
export type InsulationType = 'T90 Nylon' | 'RW90 XLPE';
export type TradeSize = '1/2"' | '3/4"' | '1"' | '1-1/4"' | '1-1/2"' | '2"' | '2-1/2"' | '3"' | '3-1/2"' | '4"';

// CEC Table 8 — Maximum fill percentages
export function getMaxFillPercent(numConductors: number): number {
  if (numConductors === 1) return 53;
  if (numConductors === 2) return 31;
  return 40; // 3 or more
}

// CEC Tables 9A-9P — Conduit internal cross-sectional areas (mm²)
// ⚠️ Approximate values — verify against CEC 2021
export const conduitAreas: Record<ConduitType, Record<TradeSize, number>> = {
  'EMT': {
    '1/2"': 161,
    '3/4"': 283,
    '1"': 490,
    '1-1/4"': 684,
    '1-1/2"': 916,
    '2"': 1534,
    '2-1/2"': 2165,
    '3"': 3356,
    '3-1/2"': 4560,
    '4"': 5901,
  },
  'Rigid PVC': {
    '1/2"': 141,
    '3/4"': 252,
    '1"': 440,
    '1-1/4"': 620,
    '1-1/2"': 838,
    '2"': 1413,
    '2-1/2"': 2010,
    '3"': 3137,
    '3-1/2"': 4282,
    '4"': 5565,
  },
  'Rigid Metal': {
    '1/2"': 161,
    '3/4"': 283,
    '1"': 490,
    '1-1/4"': 684,
    '1-1/2"': 916,
    '2"': 1534,
    '2-1/2"': 2165,
    '3"': 3356,
    '3-1/2"': 4560,
    '4"': 5901,
  },
};

// CEC Tables 6A-6K — Wire outer diameter areas with insulation (mm²)
// ⚠️ Approximate values — verify against CEC 2021
export const wireInsulationAreas: Record<InsulationType, Partial<Record<WireSize, number>>> = {
  'T90 Nylon': {
    '14': 8.97,
    '12': 11.68,
    '10': 18.10,
    '8': 23.09,
    '6': 33.17,
    '4': 48.07,
    '3': 56.06,
    '2': 62.77,
    '1': 81.07,
    '1/0': 95.60,
    '2/0': 112.9,
    '3/0': 131.9,
    '4/0': 154.1,
  },
  'RW90 XLPE': {
    '14': 13.85,
    '12': 17.34,
    '10': 24.52,
    '8': 36.17,
    '6': 47.77,
    '4': 62.77,
    '3': 73.94,
    '2': 81.07,
    '1': 101.3,
    '1/0': 119.7,
    '2/0': 137.0,
    '3/0': 158.6,
    '4/0': 180.7,
  },
};

export const tradeSizes: TradeSize[] = [
  '1/2"', '3/4"', '1"', '1-1/4"', '1-1/2"', '2"', '2-1/2"', '3"', '3-1/2"', '4"',
];

export const conduitTypes: ConduitType[] = ['EMT', 'Rigid PVC', 'Rigid Metal'];
export const insulationTypes: InsulationType[] = ['T90 Nylon', 'RW90 XLPE'];

// Wire sizes available for conduit fill (those with insulation area data)
export const conduitFillWireSizes: WireSize[] = [
  '14', '12', '10', '8', '6', '4', '3', '2', '1', '1/0', '2/0', '3/0', '4/0',
];

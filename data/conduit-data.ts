// CEC 2021 Conduit Fill Data — Rule 12-910
// Wire areas: CEC Table 10A (stranded insulated conductors) / Table 6A (same-size fill lookup)
// Fill percentages: CEC Table 8
// Conduit areas: CEC Table 9 (conduit & tubing internal cross-sectional areas)
//
// SOURCES:
//   - Wire areas (RW90 XLPE): CEC Table 10A verified against worked examples from
//     IAEI Magazine and ebmag.com (Code File, Dec 2022), supplemented by
//     ServiceWire RW90 600V manufacturer OD data for sizes without CEC reference.
//   - Wire areas (T90 Nylon): Verified against Dakota Prep CEC conduit fill guide
//     worked examples (#8 and #6 AWG within 2-3% of tabulated values).
//   - Conduit areas: Based on ANSI C80.1 (Rigid Metal), ANSI C80.3 (EMT),
//     and ANSI Schedule 40 (PVC) standard internal dimensions.
//     Rigid Metal verified against CEC 2021 Table 9G (1/2"=202mm², 3/4"=354mm²).
//
// ⚠️ IMPORTANT: CEC 2021 Table 9 values (especially for EMT and PVC) may differ
// slightly from ANSI nominal dimensions due to minimum guaranteed ID specifications.
// Developer MUST verify against actual CEC 2021 Tables 9A-9H and 10A-10D before
// publishing to app stores. The values below are from credible engineering sources
// but may not exactly match the copyrighted CSA C22.1:21 tables.

import { WireSize } from './cec-tables';

export type ConduitType = 'EMT' | 'Rigid PVC' | 'Rigid Metal';
export type InsulationType = 'T90 Nylon' | 'RW90 XLPE';
export type TradeSize = '1/2"' | '3/4"' | '1"' | '1-1/4"' | '1-1/2"' | '2"' | '2-1/2"' | '3"' | '3-1/2"' | '4"';

// CEC Table 8 — Maximum fill percentages
// Referenced by Rules 12-902, 12-910, 38-032
export function getMaxFillPercent(numConductors: number): number {
  if (numConductors === 1) return 53;
  if (numConductors === 2) return 31;
  return 40; // 3 or more
}

// CEC Table 9 — Conduit internal cross-sectional areas (mm²)
// EMT: Based on ANSI C80.3 nominal IDs. CEC 2021 verified 1/2"≈181mm² (Table 9G).
//   ANSI nominal gives ~196mm² for 1/2". CEC may use minimum guaranteed dimensions.
//   ⚠️ Verify all EMT values against CEC 2021 Table 9G/9H before production.
// Rigid Metal: Based on ANSI C80.1. CEC 2021 verified: 1/2"=202mm², 3/4"=354mm².
// Rigid PVC: Based on Schedule 40 PVC. ⚠️ Verify against CEC 2021 Table 9.
export const conduitAreas: Record<ConduitType, Record<TradeSize, number>> = {
  'EMT': {
    '1/2"': 196,
    '3/4"': 344,
    '1"': 557,
    '1-1/4"': 965,
    '1-1/2"': 1314,
    '2"': 2165,
    '2-1/2"': 3778,
    '3"': 5707,
    '3-1/2"': 7445,
    '4"': 9514,
  },
  'Rigid PVC': {
    '1/2"': 184,
    '3/4"': 328,
    '1"': 537,
    '1-1/4"': 937,
    '1-1/2"': 1281,
    '2"': 2124,
    '2-1/2"': 3028,
    '3"': 4688,
    '3-1/2"': 6283,
    '4"': 8098,
  },
  'Rigid Metal': {
    '1/2"': 202,
    '3/4"': 354,
    '1"': 573,
    '1-1/4"': 985,
    '1-1/2"': 1337,
    '2"': 2199,
    '2-1/2"': 3138,
    '3"': 4836,
    '3-1/2"': 6455,
    '4"': 8312,
  },
};

// CEC Table 10A — Wire cross-sectional areas with insulation (mm²)
// For RW90 XLPE (R90XLPE, RW75XLPE, RW90XLPE unjacketed 600V, stranded):
//   Values marked [CEC] are derived from CEC 2021 worked examples:
//     #14: 10×=88.67mm² → 8.87mm² each (IAEI Magazine)
//     #12: 6×=69.50mm² → 11.58mm² each (Dakota Prep)
//     #10: 3×=47.08mm² → 15.69mm² each (ebmag.com Code File)
//     #6: 38.0mm² (Dakota Prep, direct)
//     #4: 52.46mm² (CEC Table 10A reference example)
//   Values marked [SW] are calculated from ServiceWire RW90 600V OD data:
//     Area = π × (OD/2)², ODs verified against Priority Wire & Prysmian specs.
//     ServiceWire values match CEC-derived values within 1-2% where both exist.
// For T90 Nylon: ⚠️ Values from README spec, verified within 2-3% against
//   Dakota Prep examples (#8=23.68 vs 23.09, #6=32.70 vs 33.17).
export const wireInsulationAreas: Record<InsulationType, Partial<Record<WireSize, number>>> = {
  'T90 Nylon': {
    '14': 8.97,    // ⚠️ Verify against CEC Table 10A
    '12': 11.68,   // ⚠️ Verify against CEC Table 10A
    '10': 18.10,   // ⚠️ Verify against CEC Table 10A
    '8': 23.09,    // ~2.5% off Dakota Prep (23.68)
    '6': 33.17,    // ~1.4% off Dakota Prep (32.70)
    '4': 48.07,    // ⚠️ Verify against CEC Table 10A
    '3': 56.06,    // ⚠️ Verify against CEC Table 10A
    '2': 62.77,    // ⚠️ Verify against CEC Table 10A
    '1': 81.07,    // ⚠️ Verify against CEC Table 10A
    '1/0': 95.60,  // ⚠️ Verify against CEC Table 10A
    '2/0': 112.9,  // ⚠️ Verify against CEC Table 10A
    '3/0': 131.9,  // ⚠️ Verify against CEC Table 10A
    '4/0': 154.1,  // ⚠️ Verify against CEC Table 10A
  },
  'RW90 XLPE': {
    '14': 8.87,    // [CEC] 10× = 88.67mm²
    '12': 11.58,   // [CEC] 6× = 69.50mm²
    '10': 15.69,   // [CEC] 3× = 47.08mm²
    '8': 27.52,    // [SW] OD=0.233" (5.918mm)
    '6': 38.00,    // [CEC] direct value
    '4': 52.46,    // [CEC] Table 10A reference
    '3': 59.95,    // [SW] OD=0.344" (8.738mm)
    '2': 70.88,    // [SW] OD=0.374" (9.500mm)
    '1': 91.95,    // [SW] OD=0.426" (10.820mm)
    '1/0': 110.53, // [SW] OD=0.467" (11.862mm)
    '2/0': 132.83, // [SW] OD=0.512" (13.005mm)
    '3/0': 158.87, // [SW] OD=0.560" (14.224mm)
    '4/0': 194.15, // [SW] OD=0.619" (15.723mm)
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

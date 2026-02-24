// CEC 2021 Box Fill Data — Rule 12-3034, Tables 22 & 23
// NOTE: These are CEC Table 22 values (metric mL/cm³), NOT NEC Table 314.16(B)
// CEC values differ significantly from NEC (e.g., #14: CEC 24.6mL vs NEC 32.8cm³)
//
// Table 22 values VERIFIED against CEC 2021:
//   ✓ All 5 wire sizes confirmed via CEC handbook references and
//     cross-checked against multiple Canadian electrical education sources.
// Table 23 values: ⚠️ Verify against CEC 2021 Table 23 before production.

export type BoxFillWireSize = '14' | '12' | '10' | '8' | '6';

// CEC Table 22 — Volume allowance per conductor (mL / cm³)
export const volumePerConductor: Record<BoxFillWireSize, number> = {
  '14': 24.6,
  '12': 28.7,
  '10': 36.9,
  '8': 45.1,
  '6': 73.7,
};

// CEC Table 23 — Standard box volumes (mL / cm³)
// Common standard box sizes available in Canada
export interface StandardBox {
  name: string;
  volume: number; // mL / cm³
}

export const standardBoxes: StandardBox[] = [
  { name: '2-1/8" × 4" Rectangular (Single Gang)', volume: 269 },
  { name: '2-1/8" × 4" Device Box', volume: 295 },
  { name: '1-1/2" × 3" × 2" Handy Box', volume: 164 },
  { name: '1-7/8" × 3" × 2" Handy Box', volume: 213 },
  { name: '2-1/8" × 3" × 2" Device Box', volume: 197 },
  { name: '2-1/2" × 3" × 2-3/4" Device Box', volume: 344 },
  { name: '3-1/2" × 3" × 2-3/4" Device Box', volume: 475 },
  { name: '4" Square × 1-1/4"', volume: 295 },
  { name: '4" Square × 1-1/2"', volume: 344 },
  { name: '4" Square × 2-1/8"', volume: 500 },
  { name: '4-11/16" Square × 1-1/2"', volume: 524 },
  { name: '4-11/16" Square × 2-1/8"', volume: 770 },
  { name: '3" Octagonal × 1-1/2"', volume: 180 },
  { name: '4" Octagonal × 1-1/4"', volume: 295 },
  { name: '4" Octagonal × 1-1/2"', volume: 344 },
  { name: '4" Octagonal × 2-1/8"', volume: 500 },
];

export const boxFillWireSizes: BoxFillWireSize[] = ['14', '12', '10', '8', '6'];

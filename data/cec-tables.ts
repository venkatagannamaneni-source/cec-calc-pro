// CEC 2021 Table 2 — Ampacity of conductors, not more than 3 in raceway/cable (30°C ambient)
// Sources: CEC 2021 (CSA C22.1:21, 25th Edition), electdesign.ca, IAEI Magazine

export type WireSize =
  | '14' | '12' | '10' | '8' | '6' | '4' | '3' | '2' | '1'
  | '1/0' | '2/0' | '3/0' | '4/0'
  | '250' | '300' | '350' | '400' | '500' | '600' | '750' | '1000';

export type ConductorMaterial = 'copper' | 'aluminum';
export type InsulationTemp = 60 | 75 | 90;

export interface AmpacityEntry {
  wireSize: WireSize;
  temp60: number;
  temp75: number;
  temp90: number;
}

// CEC Table 2 — Copper conductors
export const copperAmpacity: AmpacityEntry[] = [
  { wireSize: '14',   temp60: 15,  temp75: 20,  temp90: 25  },
  { wireSize: '12',   temp60: 20,  temp75: 25,  temp90: 30  },
  { wireSize: '10',   temp60: 30,  temp75: 35,  temp90: 40  },
  { wireSize: '8',    temp60: 40,  temp75: 50,  temp90: 55  },
  { wireSize: '6',    temp60: 55,  temp75: 65,  temp90: 75  },
  { wireSize: '4',    temp60: 70,  temp75: 85,  temp90: 95  },
  { wireSize: '3',    temp60: 85,  temp75: 100, temp90: 115 },
  { wireSize: '2',    temp60: 95,  temp75: 115, temp90: 130 },
  { wireSize: '1',    temp60: 110, temp75: 130, temp90: 145 },
  { wireSize: '1/0',  temp60: 125, temp75: 150, temp90: 170 },
  { wireSize: '2/0',  temp60: 145, temp75: 175, temp90: 195 },
  { wireSize: '3/0',  temp60: 165, temp75: 200, temp90: 225 },
  { wireSize: '4/0',  temp60: 195, temp75: 230, temp90: 260 },
  { wireSize: '250',  temp60: 215, temp75: 255, temp90: 290 },
  { wireSize: '300',  temp60: 240, temp75: 285, temp90: 320 },
  { wireSize: '350',  temp60: 260, temp75: 310, temp90: 350 },
  { wireSize: '400',  temp60: 280, temp75: 335, temp90: 380 },
  { wireSize: '500',  temp60: 320, temp75: 380, temp90: 430 },
  { wireSize: '600',  temp60: 355, temp75: 420, temp90: 475 },
  { wireSize: '750',  temp60: 400, temp75: 475, temp90: 535 },
  { wireSize: '1000', temp60: 455, temp75: 545, temp90: 615 },
];

// CEC Table 2 — Aluminum conductors
export const aluminumAmpacity: AmpacityEntry[] = [
  { wireSize: '12',   temp60: 15,  temp75: 20,  temp90: 25  },
  { wireSize: '10',   temp60: 25,  temp75: 30,  temp90: 35  },
  { wireSize: '8',    temp60: 30,  temp75: 40,  temp90: 45  },
  { wireSize: '6',    temp60: 40,  temp75: 50,  temp90: 60  },
  { wireSize: '4',    temp60: 55,  temp75: 65,  temp90: 75  },
  { wireSize: '3',    temp60: 65,  temp75: 75,  temp90: 85  },
  { wireSize: '2',    temp60: 75,  temp75: 90,  temp90: 100 },
  { wireSize: '1',    temp60: 85,  temp75: 100, temp90: 115 },
  { wireSize: '1/0',  temp60: 100, temp75: 120, temp90: 135 },
  { wireSize: '2/0',  temp60: 115, temp75: 135, temp90: 150 },
  { wireSize: '3/0',  temp60: 130, temp75: 155, temp90: 175 },
  { wireSize: '4/0',  temp60: 150, temp75: 180, temp90: 205 },
  { wireSize: '250',  temp60: 170, temp75: 205, temp90: 230 },
  { wireSize: '300',  temp60: 190, temp75: 230, temp90: 255 },
  { wireSize: '350',  temp60: 210, temp75: 250, temp90: 280 },
  { wireSize: '400',  temp60: 225, temp75: 270, temp90: 305 },
  { wireSize: '500',  temp60: 260, temp75: 310, temp90: 350 },
  { wireSize: '600',  temp60: 285, temp75: 340, temp90: 385 },
  { wireSize: '750',  temp60: 320, temp75: 385, temp90: 435 },
  { wireSize: '1000', temp60: 375, temp75: 445, temp90: 500 },
];

// CEC Table 5A — Ambient temperature correction factors
// NOTE: This is CEC Table 5A (ambient temp), NOT Table 5C (conductor bundling)
export interface TempCorrectionEntry {
  label: string;
  minTemp: number;
  maxTemp: number;
  factor60: number | null;
  factor75: number | null;
  factor90: number | null;
}

export const ambientTempCorrection: TempCorrectionEntry[] = [
  { label: '10°C or less', minTemp: -Infinity, maxTemp: 10,  factor60: 1.29, factor75: 1.20, factor90: 1.15 },
  { label: '11–20°C',      minTemp: 11,        maxTemp: 20,  factor60: 1.22, factor75: 1.15, factor90: 1.12 },
  { label: '21–25°C',      minTemp: 21,        maxTemp: 25,  factor60: 1.08, factor75: 1.05, factor90: 1.04 },
  { label: '26–30°C',      minTemp: 26,        maxTemp: 30,  factor60: 1.00, factor75: 1.00, factor90: 1.00 },
  { label: '31–35°C',      minTemp: 31,        maxTemp: 35,  factor60: 0.91, factor75: 0.94, factor90: 0.96 },
  { label: '36–40°C',      minTemp: 36,        maxTemp: 40,  factor60: 0.82, factor75: 0.88, factor90: 0.91 },
  { label: '41–45°C',      minTemp: 41,        maxTemp: 45,  factor60: 0.71, factor75: 0.82, factor90: 0.87 },
  { label: '46–50°C',      minTemp: 46,        maxTemp: 50,  factor60: 0.58, factor75: 0.75, factor90: 0.82 },
  { label: '51–55°C',      minTemp: 51,        maxTemp: 55,  factor60: 0.41, factor75: 0.67, factor90: 0.76 },
  { label: '56–60°C',      minTemp: 56,        maxTemp: 60,  factor60: null, factor75: 0.58, factor90: 0.71 },
  { label: '61–70°C',      minTemp: 61,        maxTemp: 70,  factor60: null, factor75: 0.33, factor90: 0.58 },
  { label: '71–80°C',      minTemp: 71,        maxTemp: 80,  factor60: null, factor75: null, factor90: 0.41 },
];

// CEC Table 5C — Derating factors for >3 conductors in raceway/cable
// NOTE: This is CEC Table 5C (conductor bundling), NOT Table 5D (cable tray)
export interface DeratingEntry {
  label: string;
  minConductors: number;
  maxConductors: number;
  factor: number;
}

export const conductorDeratingFactors: DeratingEntry[] = [
  { label: '1–3',   minConductors: 1,  maxConductors: 3,  factor: 1.00 },
  { label: '4–6',   minConductors: 4,  maxConductors: 6,  factor: 0.80 },
  { label: '7–24',  minConductors: 7,  maxConductors: 24, factor: 0.70 },
  { label: '25–42', minConductors: 25, maxConductors: 42, factor: 0.60 },
  { label: '43+',   minConductors: 43, maxConductors: Infinity, factor: 0.50 },
];

// Wire cross-sectional areas (for voltage drop calculations)
export interface WireAreaEntry {
  wireSize: WireSize;
  areaCmil: number;
  areaMm2: number;
}

export const wireCrossSections: WireAreaEntry[] = [
  { wireSize: '14',   areaCmil: 4110,    areaMm2: 2.08  },
  { wireSize: '12',   areaCmil: 6530,    areaMm2: 3.31  },
  { wireSize: '10',   areaCmil: 10380,   areaMm2: 5.26  },
  { wireSize: '8',    areaCmil: 16510,   areaMm2: 8.37  },
  { wireSize: '6',    areaCmil: 26240,   areaMm2: 13.30 },
  { wireSize: '4',    areaCmil: 41740,   areaMm2: 21.15 },
  { wireSize: '3',    areaCmil: 52620,   areaMm2: 26.67 },
  { wireSize: '2',    areaCmil: 66360,   areaMm2: 33.62 },
  { wireSize: '1',    areaCmil: 83690,   areaMm2: 42.41 },
  { wireSize: '1/0',  areaCmil: 105600,  areaMm2: 53.49 },
  { wireSize: '2/0',  areaCmil: 133100,  areaMm2: 67.43 },
  { wireSize: '3/0',  areaCmil: 167800,  areaMm2: 85.01 },
  { wireSize: '4/0',  areaCmil: 211600,  areaMm2: 107.2 },
  { wireSize: '250',  areaCmil: 250000,  areaMm2: 126.7 },
  { wireSize: '300',  areaCmil: 300000,  areaMm2: 152.0 },
  { wireSize: '350',  areaCmil: 350000,  areaMm2: 177.3 },
  { wireSize: '400',  areaCmil: 400000,  areaMm2: 202.7 },
  { wireSize: '500',  areaCmil: 500000,  areaMm2: 253.4 },
];

// Resistivity constants at 75°C
export const resistivity = {
  copper: {
    ohmCmilPerFt: 12.9,
    ohmMm2PerM: 0.0214,
  },
  aluminum: {
    ohmCmilPerFt: 21.2,
    ohmMm2PerM: 0.0352,
  },
};

// Overcurrent protection limits
export const overcurrentLimits: Record<string, number> = {
  '14': 15,
  '12': 20,
  '10': 30,
};

// Helper to get ampacity table by material
export function getAmpacityTable(material: ConductorMaterial): AmpacityEntry[] {
  return material === 'copper' ? copperAmpacity : aluminumAmpacity;
}

// Helper to get ampacity for a given wire and insulation temperature
export function getAmpacity(
  entry: AmpacityEntry,
  insulationTemp: InsulationTemp,
): number {
  switch (insulationTemp) {
    case 60: return entry.temp60;
    case 75: return entry.temp75;
    case 90: return entry.temp90;
  }
}

// Helper to get ambient temp correction factor
export function getAmbientTempFactor(
  ambientTemp: number,
  insulationTemp: InsulationTemp,
): number | null {
  const entry = ambientTempCorrection.find(
    (e) => ambientTemp >= e.minTemp && ambientTemp <= e.maxTemp,
  );
  if (!entry) return null;
  switch (insulationTemp) {
    case 60: return entry.factor60;
    case 75: return entry.factor75;
    case 90: return entry.factor90;
  }
}

// Helper to get conductor derating factor
export function getConductorDeratingFactor(numConductors: number): number {
  const entry = conductorDeratingFactors.find(
    (e) => numConductors >= e.minConductors && numConductors <= e.maxConductors,
  );
  return entry?.factor ?? 1.0;
}

// Helper to get wire cross-section area
export function getWireArea(wireSize: WireSize): WireAreaEntry | undefined {
  return wireCrossSections.find((w) => w.wireSize === wireSize);
}

// Wire Sizing Calculator — CEC 2021 Table 2/4, Table 5A, Table 5C, Rule 4-006
//
// Rule 4-006 Termination Temperature:
//   Rule 4-006(1): Equipment >100A or >No.1 AWG → use 75°C column
//   Rule 4-006(2): Equipment ≤100A or ≤No.1 AWG → use 60°C column,
//     UNLESS equipment is specifically marked for 75°C termination.
//   Note: Most modern equipment (post-harmonization) is rated/tested at 75°C.
//   This calculator uses 75°C as the default termination check, which is
//   appropriate for most modern installations. Users with older equipment
//   rated at 60°C should verify manually.
//   Source: IAEI Magazine "Application of Rule 4-006 of the CEC"
import {
  ConductorMaterial,
  InsulationTemp,
  WireSize,
  AmpacityEntry,
  getAmpacityTable,
  getAmpacity,
  getAmbientTempFactor,
  getConductorDeratingFactor,
  overcurrentLimits,
} from '../data/cec-tables';

export interface WireSizingInput {
  material: ConductorMaterial;
  insulationTemp: InsulationTemp;
  requiredAmps: number;
  ambientTemp: number;
  numConductors: number;
}

export interface WireSizingResult {
  recommendedSize: WireSize;
  ampacityAtRatedTemp: number;
  adjustedRequiredAmpacity: number;
  tempCorrectionFactor: number;
  deratingFactor: number;
  terminationWarning: boolean;
  terminationAmpacity: number | null;
  overcurrentLimit: number | null;
  cecReference: string;
}

export function calculateWireSizing(input: WireSizingInput): WireSizingResult | { error: string } {
  const { material, insulationTemp, requiredAmps, ambientTemp, numConductors } = input;

  if (requiredAmps <= 0) {
    return { error: 'Required ampacity must be greater than 0' };
  }

  // Step 1: Get ambient temperature correction factor (Table 5A)
  const tempFactor = getAmbientTempFactor(ambientTemp, insulationTemp);
  if (tempFactor === null) {
    return { error: `No correction factor available for ${ambientTemp}°C ambient with ${insulationTemp}°C insulation` };
  }

  // Step 2: Get conductor bundling derating factor (Table 5C)
  const deratingFactor = getConductorDeratingFactor(numConductors);

  // Step 3: Calculate adjusted required ampacity
  const adjustedAmpacity = requiredAmps / (tempFactor * deratingFactor);

  // Step 4: Look up Table 2 for smallest wire where ampacity >= adjusted requirement
  const table = getAmpacityTable(material);

  // For derating, we use the insulation temp column to find the wire
  // But per Rule 4-006, final sizing must consider 75°C termination
  let selectedEntry: AmpacityEntry | null = null;
  for (const entry of table) {
    const ampacity = getAmpacity(entry, insulationTemp);
    if (ampacity >= adjustedAmpacity) {
      selectedEntry = entry;
      break;
    }
  }

  if (!selectedEntry) {
    return { error: 'No wire size available for the required ampacity. Consider parallel conductors.' };
  }

  // Step 5: Apply Rule 4-006 — check 75°C termination temperature
  const ampacityAtRated = getAmpacity(selectedEntry, insulationTemp);
  let terminationWarning = false;
  let terminationAmpacity: number | null = null;

  if (insulationTemp === 90) {
    // 90°C conductor: must check that 75°C column ampacity >= required amps
    terminationAmpacity = getAmpacity(selectedEntry, 75);
    if (terminationAmpacity < requiredAmps) {
      terminationWarning = true;
      // Need to upsize for termination rating
      for (const entry of table) {
        if (getAmpacity(entry, 75) >= requiredAmps && getAmpacity(entry, insulationTemp) >= adjustedAmpacity) {
          selectedEntry = entry;
          terminationAmpacity = getAmpacity(entry, 75);
          break;
        }
      }
    }
  }

  const ocLimit = overcurrentLimits[selectedEntry.wireSize] ?? null;

  return {
    recommendedSize: selectedEntry.wireSize,
    ampacityAtRatedTemp: getAmpacity(selectedEntry, insulationTemp),
    adjustedRequiredAmpacity: Math.ceil(adjustedAmpacity * 10) / 10,
    tempCorrectionFactor: tempFactor,
    deratingFactor,
    terminationWarning: insulationTemp === 90,
    terminationAmpacity: insulationTemp === 90 ? getAmpacity(selectedEntry, 75) : null,
    overcurrentLimit: ocLimit,
    cecReference: 'Per CEC 2021 Table 2, Table 5A, Table 5C, Rule 4-006',
  };
}

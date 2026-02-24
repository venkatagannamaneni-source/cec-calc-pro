// Voltage Drop Calculator — CEC 2021 Rule 8-102
import { ConductorMaterial, WireSize, resistivity, getWireArea } from '../data/cec-tables';

export type SystemType = 'single' | 'three';
export type UnitSystem = 'imperial' | 'metric';

export interface VoltageDropInput {
  systemType: SystemType;
  sourceVoltage: number;
  material: ConductorMaterial;
  wireSize: WireSize;
  loadCurrent: number;
  distance: number;
  unitSystem: UnitSystem;
  parallelConductors: number;
}

export interface VoltageDropResult {
  voltageDrop: number;
  voltageDropPercent: number;
  voltageAtLoad: number;
  status: 'pass' | 'warning' | 'fail';
  statusLabel: string;
  maxRecommendedDistance: number;
  distanceUnit: string;
  cecReference: string;
}

export function calculateVoltageDrop(input: VoltageDropInput): VoltageDropResult | { error: string } {
  const { systemType, sourceVoltage, material, wireSize, loadCurrent, distance, unitSystem, parallelConductors } = input;

  if (sourceVoltage <= 0) return { error: 'Source voltage must be greater than 0' };
  if (loadCurrent <= 0) return { error: 'Load current must be greater than 0' };
  if (distance <= 0) return { error: 'Distance must be greater than 0' };
  if (parallelConductors < 1) return { error: 'Must have at least 1 conductor per phase' };

  const wireArea = getWireArea(wireSize);
  if (!wireArea) return { error: `Wire size ${wireSize} not found in lookup table` };

  // Get resistivity constant and area based on unit system
  const K = unitSystem === 'imperial'
    ? resistivity[material].ohmCmilPerFt
    : resistivity[material].ohmMm2PerM;

  const A = unitSystem === 'imperial'
    ? wireArea.areaCmil * parallelConductors
    : wireArea.areaMm2 * parallelConductors;

  // Phase multiplier
  const phaseFactor = systemType === 'single' ? 2 : 1.732;

  // Vd = (phaseFactor × K × I × L) / A
  const Vd = (phaseFactor * K * loadCurrent * distance) / A;
  const VdPercent = (Vd / sourceVoltage) * 100;
  const voltageAtLoad = sourceVoltage - Vd;

  // Status: ≤3% pass, 3-5% warning, >5% fail
  let status: 'pass' | 'warning' | 'fail';
  let statusLabel: string;
  if (VdPercent <= 3) {
    status = 'pass';
    statusLabel = 'Within 3% (branch circuit limit)';
  } else if (VdPercent <= 5) {
    status = 'warning';
    statusLabel = 'Between 3-5% (exceeds branch, within total)';
  } else {
    status = 'fail';
    statusLabel = 'Exceeds 5% (over total limit)';
  }

  // Max recommended distance for 3% drop
  // 3% of Vsource = (phaseFactor × K × I × Lmax) / A
  // Lmax = (0.03 × Vsource × A) / (phaseFactor × K × I)
  const maxDist = (0.03 * sourceVoltage * A) / (phaseFactor * K * loadCurrent);

  return {
    voltageDrop: Math.round(Vd * 100) / 100,
    voltageDropPercent: Math.round(VdPercent * 100) / 100,
    voltageAtLoad: Math.round(voltageAtLoad * 100) / 100,
    status,
    statusLabel,
    maxRecommendedDistance: Math.round(maxDist * 10) / 10,
    distanceUnit: unitSystem === 'imperial' ? 'ft' : 'm',
    cecReference: 'Per CEC 2021 Rule 8-102',
  };
}

// Number formatting helpers

export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatVolume(value: number): string {
  return `${value.toFixed(1)} mL`;
}

export function formatArea(value: number): string {
  return `${value.toFixed(2)} mm²`;
}

export function formatAmps(value: number): string {
  return `${value.toFixed(0)}A`;
}

export function formatVoltage(value: number): string {
  return `${value.toFixed(1)}V`;
}

export function formatDistance(value: number, unit: string): string {
  return `${value.toFixed(1)} ${unit}`;
}

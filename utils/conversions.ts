// Imperial/Metric Conversion Functions

export type ConversionCategory =
  | 'length'
  | 'area'
  | 'volume'
  | 'weight'
  | 'temperature'
  | 'electrical';

export interface ConversionUnit {
  label: string;
  category: ConversionCategory;
  toBase: (value: number) => number;   // Convert to base unit
  fromBase: (value: number) => number; // Convert from base unit
}

export interface ConversionPair {
  label: string;
  category: ConversionCategory;
  imperialUnit: string;
  metricUnit: string;
  toMetric: (imperial: number) => number;
  toImperial: (metric: number) => number;
}

export const conversions: ConversionPair[] = [
  // Length
  {
    label: 'Inches / Millimeters',
    category: 'length',
    imperialUnit: 'in',
    metricUnit: 'mm',
    toMetric: (v) => v * 25.4,
    toImperial: (v) => v / 25.4,
  },
  {
    label: 'Feet / Meters',
    category: 'length',
    imperialUnit: 'ft',
    metricUnit: 'm',
    toMetric: (v) => v * 0.3048,
    toImperial: (v) => v / 0.3048,
  },
  {
    label: 'Yards / Meters',
    category: 'length',
    imperialUnit: 'yd',
    metricUnit: 'm',
    toMetric: (v) => v * 0.9144,
    toImperial: (v) => v / 0.9144,
  },
  // Area
  {
    label: 'Square Feet / Square Meters',
    category: 'area',
    imperialUnit: 'sq ft',
    metricUnit: 'sq m',
    toMetric: (v) => v * 0.092903,
    toImperial: (v) => v / 0.092903,
  },
  {
    label: 'Square Inches / Square Centimeters',
    category: 'area',
    imperialUnit: 'sq in',
    metricUnit: 'sq cm',
    toMetric: (v) => v * 6.4516,
    toImperial: (v) => v / 6.4516,
  },
  // Volume
  {
    label: 'Cubic Feet / Cubic Meters',
    category: 'volume',
    imperialUnit: 'cu ft',
    metricUnit: 'cu m',
    toMetric: (v) => v * 0.0283168,
    toImperial: (v) => v / 0.0283168,
  },
  {
    label: 'Imperial Gallons / Liters',
    category: 'volume',
    imperialUnit: 'gal',
    metricUnit: 'L',
    toMetric: (v) => v * 4.54609,
    toImperial: (v) => v / 4.54609,
  },
  // Weight
  {
    label: 'Pounds / Kilograms',
    category: 'weight',
    imperialUnit: 'lb',
    metricUnit: 'kg',
    toMetric: (v) => v * 0.453592,
    toImperial: (v) => v / 0.453592,
  },
  // Temperature
  {
    label: 'Fahrenheit / Celsius',
    category: 'temperature',
    imperialUnit: '°F',
    metricUnit: '°C',
    toMetric: (v) => (v - 32) * (5 / 9),
    toImperial: (v) => v * (9 / 5) + 32,
  },
  // Electrical
  {
    label: 'Circular Mils / mm²',
    category: 'electrical',
    imperialUnit: 'cmil',
    metricUnit: 'mm²',
    toMetric: (v) => v * 0.000506707,
    toImperial: (v) => v / 0.000506707,
  },
];

export function convert(
  value: number,
  conversionIndex: number,
  direction: 'toMetric' | 'toImperial',
): number {
  const pair = conversions[conversionIndex];
  if (!pair) return 0;
  const result = direction === 'toMetric' ? pair.toMetric(value) : pair.toImperial(value);
  return Math.round(result * 10000) / 10000;
}

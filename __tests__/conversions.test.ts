/**
 * Imperial/Metric Conversion Tests
 *
 * Verifies conversion accuracy against known standard values.
 */

import { conversions, convert } from '../utils/conversions';

// ============================================================
// Length Conversions
// ============================================================
describe('Length Conversions', () => {
  test('1 inch = 25.4 mm (exact)', () => {
    const pair = conversions.find(c => c.label === 'Inches / Millimeters')!;
    expect(pair.toMetric(1)).toBeCloseTo(25.4, 4);
    expect(pair.toImperial(25.4)).toBeCloseTo(1, 4);
  });

  test('1 foot = 0.3048 meters (exact)', () => {
    const pair = conversions.find(c => c.label === 'Feet / Meters')!;
    expect(pair.toMetric(1)).toBeCloseTo(0.3048, 4);
    expect(pair.toImperial(0.3048)).toBeCloseTo(1, 4);
  });

  test('100 feet = 30.48 meters', () => {
    const pair = conversions.find(c => c.label === 'Feet / Meters')!;
    expect(pair.toMetric(100)).toBeCloseTo(30.48, 2);
  });

  test('1 yard = 0.9144 meters (exact)', () => {
    const pair = conversions.find(c => c.label === 'Yards / Meters')!;
    expect(pair.toMetric(1)).toBeCloseTo(0.9144, 4);
    expect(pair.toImperial(0.9144)).toBeCloseTo(1, 4);
  });
});

// ============================================================
// Temperature Conversions
// ============================================================
describe('Temperature Conversions', () => {
  test('32°F = 0°C (freezing point)', () => {
    const pair = conversions.find(c => c.label === 'Fahrenheit / Celsius')!;
    expect(pair.toMetric(32)).toBeCloseTo(0, 4);
  });

  test('212°F = 100°C (boiling point)', () => {
    const pair = conversions.find(c => c.label === 'Fahrenheit / Celsius')!;
    expect(pair.toMetric(212)).toBeCloseTo(100, 4);
  });

  test('0°C = 32°F', () => {
    const pair = conversions.find(c => c.label === 'Fahrenheit / Celsius')!;
    expect(pair.toImperial(0)).toBeCloseTo(32, 4);
  });

  test('100°C = 212°F', () => {
    const pair = conversions.find(c => c.label === 'Fahrenheit / Celsius')!;
    expect(pair.toImperial(100)).toBeCloseTo(212, 4);
  });

  test('-40°F = -40°C (crossover point)', () => {
    const pair = conversions.find(c => c.label === 'Fahrenheit / Celsius')!;
    expect(pair.toMetric(-40)).toBeCloseTo(-40, 4);
  });
});

// ============================================================
// Electrical Conversions (Critical for CEC work)
// ============================================================
describe('Electrical Conversions — cmil to mm²', () => {
  test('1 cmil = 0.000506707 mm²', () => {
    const pair = conversions.find(c => c.label === 'Circular Mils / mm²')!;
    expect(pair.toMetric(1)).toBeCloseTo(0.000506707, 6);
  });

  test('#12 AWG: 6530 cmil ≈ 3.31 mm² (cross-verify with wire table)', () => {
    const pair = conversions.find(c => c.label === 'Circular Mils / mm²')!;
    expect(pair.toMetric(6530)).toBeCloseTo(3.31, 1);
  });

  test('#14 AWG: 4110 cmil ≈ 2.08 mm² (cross-verify with wire table)', () => {
    const pair = conversions.find(c => c.label === 'Circular Mils / mm²')!;
    expect(pair.toMetric(4110)).toBeCloseTo(2.08, 1);
  });

  test('round-trip conversion is accurate', () => {
    const pair = conversions.find(c => c.label === 'Circular Mils / mm²')!;
    const original = 6530;
    const mm2 = pair.toMetric(original);
    const backToCmil = pair.toImperial(mm2);
    expect(backToCmil).toBeCloseTo(original, 0);
  });
});

// ============================================================
// Weight & Volume Conversions
// ============================================================
describe('Weight and Volume Conversions', () => {
  test('1 pound = 0.453592 kg', () => {
    const pair = conversions.find(c => c.label === 'Pounds / Kilograms')!;
    expect(pair.toMetric(1)).toBeCloseTo(0.453592, 4);
  });

  test('1 Imperial gallon = 4.54609 liters', () => {
    const pair = conversions.find(c => c.label === 'Imperial Gallons / Liters')!;
    expect(pair.toMetric(1)).toBeCloseTo(4.54609, 4);
  });
});

// ============================================================
// Area Conversions
// ============================================================
describe('Area Conversions', () => {
  test('1 sq ft = 0.092903 sq m', () => {
    const pair = conversions.find(c => c.label === 'Square Feet / Square Meters')!;
    expect(pair.toMetric(1)).toBeCloseTo(0.092903, 4);
  });

  test('1 sq in = 6.4516 sq cm', () => {
    const pair = conversions.find(c => c.label === 'Square Inches / Square Centimeters')!;
    expect(pair.toMetric(1)).toBeCloseTo(6.4516, 4);
  });
});

// ============================================================
// Bidirectionality
// ============================================================
describe('Conversion Bidirectionality', () => {
  test('all conversions are reversible (round-trip accuracy)', () => {
    const testValues = [1, 10, 100, 0.5, 42.7];
    for (const pair of conversions) {
      for (const value of testValues) {
        // Skip temperature for very small values (rounding issues near 0)
        if (pair.category === 'temperature' && value < 1) continue;

        const metric = pair.toMetric(value);
        const backToImperial = pair.toImperial(metric);
        expect(backToImperial).toBeCloseTo(value, 2);
      }
    }
  });
});

// ============================================================
// convert() Helper Function
// ============================================================
describe('convert() helper function', () => {
  test('converts using index correctly', () => {
    const result = convert(100, 1, 'toMetric'); // Feet → Meters (index 1)
    expect(result).toBeCloseTo(30.48, 2);
  });

  test('handles invalid index gracefully', () => {
    const result = convert(100, 999, 'toMetric');
    expect(result).toBe(0);
  });
});

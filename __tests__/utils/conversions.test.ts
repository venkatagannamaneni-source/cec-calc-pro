import { convert, conversions } from '../../utils/conversions';

describe('convert', () => {
  test('inches to millimeters: 1 in = 25.4 mm', () => {
    expect(convert(1, 0, 'toMetric')).toBeCloseTo(25.4, 4);
  });

  test('millimeters to inches: 25.4 mm = 1 in', () => {
    expect(convert(25.4, 0, 'toImperial')).toBeCloseTo(1, 4);
  });

  test('feet to meters: 1 ft = 0.3048 m', () => {
    expect(convert(1, 1, 'toMetric')).toBeCloseTo(0.3048, 4);
  });

  test('meters to feet: 1 m = 3.2808 ft', () => {
    expect(convert(1, 1, 'toImperial')).toBeCloseTo(3.2808, 3);
  });

  test('yards to meters: 1 yd = 0.9144 m', () => {
    expect(convert(1, 2, 'toMetric')).toBeCloseTo(0.9144, 4);
  });

  test('square feet to square meters: 1 sq ft = 0.092903 sq m', () => {
    expect(convert(1, 3, 'toMetric')).toBeCloseTo(0.092903, 4);
  });

  test('square inches to square centimeters: 1 sq in = 6.4516 sq cm', () => {
    expect(convert(1, 4, 'toMetric')).toBeCloseTo(6.4516, 4);
  });

  test('cubic feet to cubic meters: 1 cu ft = 0.0283168 cu m', () => {
    expect(convert(1, 5, 'toMetric')).toBeCloseTo(0.0283168, 4);
  });

  test('imperial gallons to liters: 1 gal = 4.54609 L', () => {
    expect(convert(1, 6, 'toMetric')).toBeCloseTo(4.54609, 4);
  });

  test('pounds to kilograms: 1 lb = 0.453592 kg', () => {
    expect(convert(1, 7, 'toMetric')).toBeCloseTo(0.453592, 4);
  });

  test('Fahrenheit to Celsius: 32°F = 0°C', () => {
    expect(convert(32, 8, 'toMetric')).toBeCloseTo(0, 4);
  });

  test('Celsius to Fahrenheit: 100°C = 212°F', () => {
    expect(convert(100, 8, 'toImperial')).toBeCloseTo(212, 4);
  });

  test('Fahrenheit to Celsius: 212°F = 100°C', () => {
    expect(convert(212, 8, 'toMetric')).toBeCloseTo(100, 4);
  });

  test('circular mils to mm²: 1000 cmil = 0.506707 mm²', () => {
    expect(convert(1000, 9, 'toMetric')).toBeCloseTo(0.506707, 3);
  });

  test('round-trip conversion preserves value', () => {
    // Test all conversion pairs: imperial → metric → imperial should return original
    for (let i = 0; i < conversions.length; i++) {
      const original = 42;
      const metric = convert(original, i, 'toMetric');
      const roundTrip = convert(metric, i, 'toImperial');
      expect(roundTrip).toBeCloseTo(original, 1);
    }
  });

  test('zero converts to zero (except temperature)', () => {
    // All linear conversions: 0 → 0
    for (let i = 0; i < conversions.length; i++) {
      if (conversions[i].category === 'temperature') continue;
      expect(convert(0, i, 'toMetric')).toBe(0);
      expect(convert(0, i, 'toImperial')).toBe(0);
    }
  });

  test('invalid conversion index returns 0', () => {
    expect(convert(100, -1, 'toMetric')).toBe(0);
    expect(convert(100, 999, 'toMetric')).toBe(0);
  });
});

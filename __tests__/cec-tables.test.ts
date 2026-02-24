/**
 * CEC 2021 Data Table Verification Tests
 *
 * These tests verify EVERY data value in the CEC tables against the
 * authoritative reference values from the README specification.
 * Sources: CEC 2021 (CSA C22.1:21, 25th Edition), electdesign.ca, IAEI Magazine
 *
 * IMPORTANT: Any test failure here indicates a data discrepancy that could
 * produce dangerous calculation results for electricians.
 */

import {
  copperAmpacity,
  aluminumAmpacity,
  ambientTempCorrection,
  conductorDeratingFactors,
  wireCrossSections,
  resistivity,
  overcurrentLimits,
  getAmpacityTable,
  getAmpacity,
  getAmbientTempFactor,
  getConductorDeratingFactor,
  getWireArea,
} from '../data/cec-tables';

// ============================================================
// CEC Table 2 — Copper Ampacity (every single value)
// ============================================================
describe('CEC Table 2 — Copper Conductor Ampacity', () => {
  // Reference: README Table 2, verified against electdesign.ca and IAEI Magazine
  const expectedCopper: [string, number, number, number][] = [
    // [wireSize, 60°C, 75°C, 90°C]
    ['14',   15,  20,  25 ],
    ['12',   20,  25,  30 ],
    ['10',   30,  35,  40 ],
    ['8',    40,  50,  55 ],
    ['6',    55,  65,  75 ],
    ['4',    70,  85,  95 ],
    ['3',    85,  100, 115],
    ['2',    95,  115, 130],
    ['1',    110, 130, 145],
    ['1/0',  125, 150, 170],
    ['2/0',  145, 175, 195],
    ['3/0',  165, 200, 225],
    ['4/0',  195, 230, 260],
    ['250',  215, 255, 290],
    ['300',  240, 285, 320],
    ['350',  260, 310, 350],
    ['400',  280, 335, 380],
    ['500',  320, 380, 430],
    ['600',  355, 420, 475],
    ['750',  400, 475, 535],
    ['1000', 455, 545, 615],
  ];

  test('has correct number of entries (21 wire sizes)', () => {
    expect(copperAmpacity).toHaveLength(21);
  });

  test.each(expectedCopper)(
    '#%s AWG copper: 60°C=%dA, 75°C=%dA, 90°C=%dA',
    (wireSize, temp60, temp75, temp90) => {
      const entry = copperAmpacity.find(e => e.wireSize === wireSize);
      expect(entry).toBeDefined();
      expect(entry!.temp60).toBe(temp60);
      expect(entry!.temp75).toBe(temp75);
      expect(entry!.temp90).toBe(temp90);
    },
  );

  // Critical verification test cases from README
  test('README test case: #3 AWG copper at 90°C = 115A', () => {
    const entry = copperAmpacity.find(e => e.wireSize === '3');
    expect(entry!.temp90).toBe(115);
  });

  test('README test case: #3/0 AWG copper at 75°C = 200A', () => {
    const entry = copperAmpacity.find(e => e.wireSize === '3/0');
    expect(entry!.temp75).toBe(200);
  });
});

// ============================================================
// CEC Table 4 — Aluminum Ampacity (every single value)
// Source: Southwire SIMpull RW90 Aluminum spec sheet (CEC Table 4 reference, 2015 CEC)
// ============================================================
describe('CEC Table 4 — Aluminum Conductor Ampacity', () => {
  const expectedAluminum: [string, number, number, number][] = [
    ['12',   15,  20,  25 ],
    ['10',   25,  30,  35 ],
    ['8',    30,  40,  45 ],
    ['6',    40,  50,  55 ],  // 55A at 90°C (NOT 60A — 60A is Rule 8-106 residential exception)
    ['4',    55,  65,  75 ],
    ['3',    65,  75,  85 ],
    ['2',    75,  90,  100],
    ['1',    85,  100, 115],
    ['1/0',  100, 120, 135],
    ['2/0',  115, 135, 150],
    ['3/0',  130, 155, 175],
    ['4/0',  150, 180, 205],
    ['250',  170, 205, 230],
    ['300',  195, 230, 260],  // Corrected: was 190/255, Southwire confirms 195/260
    ['350',  210, 250, 280],
    ['400',  225, 270, 305],
    ['500',  260, 310, 350],
    ['600',  285, 340, 385],
    ['750',  320, 385, 435],
    ['1000', 375, 445, 500],
  ];

  test('has correct number of entries (20 wire sizes, no #14)', () => {
    expect(aluminumAmpacity).toHaveLength(20);
  });

  test('aluminum does NOT have #14 AWG (CEC does not list it)', () => {
    expect(aluminumAmpacity.find(e => e.wireSize === '14')).toBeUndefined();
  });

  test.each(expectedAluminum)(
    '#%s AWG aluminum: 60°C=%dA, 75°C=%dA, 90°C=%dA',
    (wireSize, temp60, temp75, temp90) => {
      const entry = aluminumAmpacity.find(e => e.wireSize === wireSize);
      expect(entry).toBeDefined();
      expect(entry!.temp60).toBe(temp60);
      expect(entry!.temp75).toBe(temp75);
      expect(entry!.temp90).toBe(temp90);
    },
  );
});

// ============================================================
// CEC Table 5A — Ambient Temperature Correction Factors
// ============================================================
describe('CEC Table 5A — Ambient Temperature Correction Factors', () => {
  // Reference: CEC 2021 Table 5A, confirmed by AES Engineering Rule 4-006 article
  const expectedFactors: [string, number, number, number | null, number | null, number | null][] = [
    // [label, minTemp, maxTemp, factor60, factor75, factor90]
    ['10°C or less', -Infinity, 10,  1.29, 1.20, 1.15],
    ['11–20°C',      11,        20,  1.22, 1.15, 1.12],
    ['21–25°C',      21,        25,  1.08, 1.05, 1.04],
    ['26–30°C',      26,        30,  1.00, 1.00, 1.00],
    ['31–35°C',      31,        35,  0.91, 0.94, 0.96],
    ['36–40°C',      36,        40,  0.82, 0.88, 0.91],
    ['41–45°C',      41,        45,  0.71, 0.82, 0.87],
    ['46–50°C',      46,        50,  0.58, 0.75, 0.82],
    ['51–55°C',      51,        55,  0.41, 0.67, 0.76],
    ['56–60°C',      56,        60,  null, 0.58, 0.71],
    ['61–70°C',      61,        70,  null, 0.33, 0.58],
    ['71–80°C',      71,        80,  null, null, 0.41],
  ];

  test('has correct number of temperature ranges (12)', () => {
    expect(ambientTempCorrection).toHaveLength(12);
  });

  test.each(expectedFactors)(
    '%s: 60°C=%s, 75°C=%s, 90°C=%s',
    (_label, _minTemp, _maxTemp, factor60, factor75, factor90) => {
      const entry = ambientTempCorrection.find(e => e.label === _label);
      expect(entry).toBeDefined();
      expect(entry!.factor60).toBe(factor60);
      expect(entry!.factor75).toBe(factor75);
      expect(entry!.factor90).toBe(factor90);
    },
  );

  // README critical test case
  test('README test case: 90°C conductor at 40°C ambient = 0.91 factor', () => {
    const factor = getAmbientTempFactor(40, 90);
    expect(factor).toBe(0.91);
  });

  // Verify standard condition (30°C = 1.0)
  test('standard ambient (30°C) returns 1.0 for all insulation types', () => {
    expect(getAmbientTempFactor(30, 60)).toBe(1.00);
    expect(getAmbientTempFactor(30, 75)).toBe(1.00);
    expect(getAmbientTempFactor(30, 90)).toBe(1.00);
  });

  // Verify null returns for out-of-range combinations
  test('60°C insulation returns null above 55°C ambient', () => {
    expect(getAmbientTempFactor(56, 60)).toBeNull();
    expect(getAmbientTempFactor(65, 60)).toBeNull();
    expect(getAmbientTempFactor(75, 60)).toBeNull();
  });

  test('75°C insulation returns null above 70°C ambient', () => {
    expect(getAmbientTempFactor(75, 75)).toBeNull();
  });
});

// ============================================================
// CEC Table 5C — Conductor Bundling Derating Factors
// ============================================================
describe('CEC Table 5C — Conductor Bundling Derating Factors', () => {
  test('1-3 conductors: factor = 1.00 (no derating)', () => {
    expect(getConductorDeratingFactor(1)).toBe(1.00);
    expect(getConductorDeratingFactor(2)).toBe(1.00);
    expect(getConductorDeratingFactor(3)).toBe(1.00);
  });

  test('4-6 conductors: factor = 0.80', () => {
    expect(getConductorDeratingFactor(4)).toBe(0.80);
    expect(getConductorDeratingFactor(5)).toBe(0.80);
    expect(getConductorDeratingFactor(6)).toBe(0.80);
  });

  // README critical test case
  test('README test case: 7 conductors in raceway = 0.70 factor', () => {
    expect(getConductorDeratingFactor(7)).toBe(0.70);
  });

  test('7-24 conductors: factor = 0.70', () => {
    expect(getConductorDeratingFactor(7)).toBe(0.70);
    expect(getConductorDeratingFactor(15)).toBe(0.70);
    expect(getConductorDeratingFactor(24)).toBe(0.70);
  });

  test('25-42 conductors: factor = 0.60', () => {
    expect(getConductorDeratingFactor(25)).toBe(0.60);
    expect(getConductorDeratingFactor(35)).toBe(0.60);
    expect(getConductorDeratingFactor(42)).toBe(0.60);
  });

  test('43+ conductors: factor = 0.50', () => {
    expect(getConductorDeratingFactor(43)).toBe(0.50);
    expect(getConductorDeratingFactor(100)).toBe(0.50);
    expect(getConductorDeratingFactor(1000)).toBe(0.50);
  });
});

// ============================================================
// Wire Cross-Sectional Areas
// ============================================================
describe('Wire Cross-Sectional Areas', () => {
  const expectedAreas: [string, number, number][] = [
    // [wireSize, areaCmil, areaMm2]
    ['14',  4110,   2.08],
    ['12',  6530,   3.31],
    ['10',  10380,  5.26],
    ['8',   16510,  8.37],
    ['6',   26240,  13.30],
    ['4',   41740,  21.15],
    ['3',   52620,  26.67],
    ['2',   66360,  33.62],
    ['1',   83690,  42.41],
    ['1/0', 105600, 53.49],
    ['2/0', 133100, 67.43],
    ['3/0', 167800, 85.01],
    ['4/0', 211600, 107.2],
    ['250', 250000, 126.7],
    ['300', 300000, 152.0],
    ['350', 350000, 177.3],
    ['400', 400000, 202.7],
    ['500', 500000, 253.4],
  ];

  test.each(expectedAreas)(
    '#%s AWG: %d cmil, %s mm²',
    (wireSize, areaCmil, areaMm2) => {
      const entry = getWireArea(wireSize as any);
      expect(entry).toBeDefined();
      expect(entry!.areaCmil).toBe(areaCmil);
      expect(entry!.areaMm2).toBe(areaMm2);
    },
  );
});

// ============================================================
// Resistivity Constants
// ============================================================
describe('Resistivity Constants at 75°C', () => {
  test('copper: 12.9 ohm·cmil/ft, 0.0214 ohm·mm²/m', () => {
    expect(resistivity.copper.ohmCmilPerFt).toBe(12.9);
    expect(resistivity.copper.ohmMm2PerM).toBe(0.0214);
  });

  test('aluminum: 21.2 ohm·cmil/ft, 0.0352 ohm·mm²/m', () => {
    expect(resistivity.aluminum.ohmCmilPerFt).toBe(21.2);
    expect(resistivity.aluminum.ohmMm2PerM).toBe(0.0352);
  });

  // Cross-verify metric and imperial K values are consistent
  test('metric K = imperial K × 0.000506707 / 0.3048 (unit conversion)', () => {
    const copperMetricExpected = 12.9 * 0.000506707 / 0.3048;
    expect(resistivity.copper.ohmMm2PerM).toBeCloseTo(copperMetricExpected, 3);

    const aluminumMetricExpected = 21.2 * 0.000506707 / 0.3048;
    expect(resistivity.aluminum.ohmMm2PerM).toBeCloseTo(aluminumMetricExpected, 3);
  });
});

// ============================================================
// Overcurrent Protection Limits
// ============================================================
describe('Overcurrent Protection Limits', () => {
  test('#14 AWG: max 15A device', () => {
    expect(overcurrentLimits['14']).toBe(15);
  });

  test('#12 AWG: max 20A device', () => {
    expect(overcurrentLimits['12']).toBe(20);
  });

  test('#10 AWG: max 30A device', () => {
    expect(overcurrentLimits['10']).toBe(30);
  });

  test('larger sizes have no fixed overcurrent limit', () => {
    expect(overcurrentLimits['8']).toBeUndefined();
    expect(overcurrentLimits['6']).toBeUndefined();
    expect(overcurrentLimits['4']).toBeUndefined();
  });
});

// ============================================================
// Helper Function Tests
// ============================================================
describe('Helper Functions', () => {
  test('getAmpacityTable returns copper table for copper', () => {
    expect(getAmpacityTable('copper')).toBe(copperAmpacity);
  });

  test('getAmpacityTable returns aluminum table for aluminum', () => {
    expect(getAmpacityTable('aluminum')).toBe(aluminumAmpacity);
  });

  test('getAmpacity correctly selects temperature column', () => {
    const entry = copperAmpacity.find(e => e.wireSize === '3')!;
    expect(getAmpacity(entry, 60)).toBe(85);
    expect(getAmpacity(entry, 75)).toBe(100);
    expect(getAmpacity(entry, 90)).toBe(115);
  });
});

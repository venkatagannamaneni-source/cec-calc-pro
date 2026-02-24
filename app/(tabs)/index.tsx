// Wire Sizing Calculator (FREE) — CEC 2021 Table 2, Table 5A, Table 5C, Rule 4-006
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { CalculatorCard } from '../../components/CalculatorCard';
import { ResultDisplay } from '../../components/ResultDisplay';
import { PickerSelect } from '../../components/PickerSelect';
import { NumberInput } from '../../components/NumberInput';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useCalculation } from '../../hooks/useCalculation';
import { calculateWireSizing, WireSizingInput, WireSizingResult } from '../../utils/wire-sizing';
import { ConductorMaterial, InsulationTemp } from '../../data/cec-tables';

const materialOptions = [
  { label: 'Copper', value: 'copper' },
  { label: 'Aluminum', value: 'aluminum' },
];

const insulationOptions = [
  { label: '60°C (TW)', value: '60' },
  { label: '75°C (T90 Nylon)', value: '75' },
  { label: '90°C (RW90 XLPE)', value: '90' },
];

const ambientTempOptions = [
  { label: '10°C or less', value: '10' },
  { label: '15°C', value: '15' },
  { label: '20°C', value: '20' },
  { label: '25°C', value: '25' },
  { label: '30°C (Standard)', value: '30' },
  { label: '35°C', value: '35' },
  { label: '40°C', value: '40' },
  { label: '45°C', value: '45' },
  { label: '50°C', value: '50' },
  { label: '55°C', value: '55' },
  { label: '60°C', value: '60' },
];

const conductorCountOptions = [
  { label: '3 or fewer', value: '3' },
  { label: '4–6', value: '5' },
  { label: '7–24', value: '10' },
  { label: '25–42', value: '30' },
  { label: '43+', value: '50' },
];

export default function WireSizingScreen() {
  const [material, setMaterial] = useState<string>('copper');
  const [insulationTemp, setInsulationTemp] = useState<string>('75');
  const [requiredAmps, setRequiredAmps] = useState('');
  const [ambientTemp, setAmbientTemp] = useState<string>('30');
  const [numConductors, setNumConductors] = useState<string>('3');

  const { result, error, calculate } = useCalculation<WireSizingInput, WireSizingResult>(
    calculateWireSizing,
  );

  const handleCalculate = () => {
    const amps = parseFloat(requiredAmps);
    if (isNaN(amps) || amps <= 0) return;

    calculate({
      material: material as ConductorMaterial,
      insulationTemp: parseInt(insulationTemp) as InsulationTemp,
      requiredAmps: amps,
      ambientTemp: parseInt(ambientTemp),
      numConductors: parseInt(numConductors),
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={Typography.title}>Wire Sizing Calculator</Text>
        <Text style={Typography.cecReference}>CEC 2021 Table 2, Rule 4-004, Rule 4-006</Text>
      </View>

      <CalculatorCard>
        <PickerSelect
          label="Conductor Material"
          options={materialOptions}
          selectedValue={material}
          onValueChange={setMaterial}
        />
        <PickerSelect
          label="Insulation Temperature Rating"
          options={insulationOptions}
          selectedValue={insulationTemp}
          onValueChange={setInsulationTemp}
        />
        <NumberInput
          label="Required Ampacity"
          value={requiredAmps}
          onChangeText={setRequiredAmps}
          suffix="A"
          placeholder="Enter amps"
        />
        <PickerSelect
          label="Ambient Temperature"
          options={ambientTempOptions}
          selectedValue={ambientTemp}
          onValueChange={setAmbientTemp}
        />
        <PickerSelect
          label="Conductors in Raceway"
          options={conductorCountOptions}
          selectedValue={numConductors}
          onValueChange={setNumConductors}
        />
      </CalculatorCard>

      <TouchableOpacity style={styles.calculateButton} onPress={handleCalculate}>
        <Text style={styles.calculateButtonText}>Calculate</Text>
      </TouchableOpacity>

      {error && (
        <CalculatorCard>
          <Text style={styles.errorText}>{error}</Text>
        </CalculatorCard>
      )}

      {result && (
        <CalculatorCard>
          <ResultDisplay
            label="Recommended Wire Size"
            value={`#${result.recommendedSize} AWG`}
          />
          <View style={styles.detailRow}>
            <Text style={Typography.bodySecondary}>Ampacity at rated temp:</Text>
            <Text style={Typography.body}>{result.ampacityAtRatedTemp}A</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={Typography.bodySecondary}>Adjusted required ampacity:</Text>
            <Text style={Typography.body}>{result.adjustedRequiredAmpacity}A</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={Typography.bodySecondary}>Temp correction factor:</Text>
            <Text style={Typography.body}>{result.tempCorrectionFactor}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={Typography.bodySecondary}>Derating factor:</Text>
            <Text style={Typography.body}>{result.deratingFactor}</Text>
          </View>
          {result.overcurrentLimit && (
            <View style={styles.detailRow}>
              <Text style={Typography.bodySecondary}>Max overcurrent device:</Text>
              <Text style={Typography.body}>{result.overcurrentLimit}A</Text>
            </View>
          )}
          {result.terminationWarning && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                Rule 4-006: Equipment terminations are typically rated 75°C.
                {result.terminationAmpacity && ` The 75°C ampacity for this wire is ${result.terminationAmpacity}A.`}
                {' '}The 90°C rating is used for derating calculations only.
              </Text>
            </View>
          )}
          <Text style={[Typography.cecReference, { marginTop: 12, textAlign: 'center' }]}>
            {result.cecReference}
          </Text>
        </CalculatorCard>
      )}

      <Text style={styles.disclaimer}>
        This app is a calculation aid only. Always verify calculations against the official Canadian Electrical Code. Not a substitute for professional engineering judgment.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 16,
  },
  calculateButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  calculateButtonText: {
    color: Colors.buttonText,
    fontSize: 18,
    fontWeight: '700',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  warningBox: {
    backgroundColor: '#3E2723',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  warningText: {
    color: Colors.warning,
    fontSize: 13,
  },
  errorText: {
    color: Colors.error,
    fontSize: 16,
    textAlign: 'center',
  },
  disclaimer: {
    color: Colors.textSecondary,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
});

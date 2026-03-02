import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { CalculatorCard } from '../../../components/CalculatorCard';
import { ResultDisplay } from '../../../components/ResultDisplay';
import { PickerSelect } from '../../../components/PickerSelect';
import { NumberInput } from '../../../components/NumberInput';
import { SoftLockOverlay } from '../../../components/SoftLockOverlay';
import { Colors } from '../../../constants/colors';
import { Typography } from '../../../constants/typography';
import { useProStatus } from '../../../hooks/useProStatus';
import { useCalculation } from '../../../hooks/useCalculation';
import { useCalculationHistory } from '../../../hooks/useCalculationHistory';
import { useUserPreferences } from '../../../hooks/useUserPreferences';
import { calculateVoltageDrop, VoltageDropInput, VoltageDropResult, SystemType, UnitSystem } from '../../../utils/voltage-drop';
import { ConductorMaterial, WireSize, wireCrossSections } from '../../../data/cec-tables';

const systemTypeOptions = [
  { label: 'Single Phase', value: 'single' },
  { label: 'Three Phase', value: 'three' },
];

const voltagePresets = [
  { label: '120V', value: '120' },
  { label: '208V', value: '208' },
  { label: '240V', value: '240' },
  { label: '347V', value: '347' },
  { label: '480V', value: '480' },
  { label: '600V', value: '600' },
];

const materialOptions = [
  { label: 'Copper', value: 'copper' },
  { label: 'Aluminum', value: 'aluminum' },
];

const wireSizeOptions = wireCrossSections.map((w) => ({
  label: `#${w.wireSize} AWG`,
  value: w.wireSize,
}));

const unitOptions = [
  { label: 'Imperial (feet)', value: 'imperial' },
  { label: 'Metric (meters)', value: 'metric' },
];

const parallelOptions = [
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
];

export default function VoltageDropScreen() {
  const { isPro } = useProStatus();
  const { addEntry } = useCalculationHistory();
  const { preferences } = useUserPreferences();
  const [systemType, setSystemType] = useState<string>('single');
  const [sourceVoltage, setSourceVoltage] = useState('120');
  const [material, setMaterial] = useState<string>(preferences.defaultMaterial);
  const [wireSize, setWireSize] = useState<string>('12');
  const [loadCurrent, setLoadCurrent] = useState('');
  const [distance, setDistance] = useState('');
  const [unitSystem, setUnitSystem] = useState<string>(preferences.unitSystem);
  const [parallelConductors, setParallelConductors] = useState('1');

  const { result, error, calculate } = useCalculation<VoltageDropInput, VoltageDropResult>(
    calculateVoltageDrop,
  );

  const handleCalculate = () => {
    const current = parseFloat(loadCurrent);
    const dist = parseFloat(distance);
    const voltage = parseFloat(sourceVoltage);
    if (isNaN(current) || isNaN(dist) || isNaN(voltage)) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const input: VoltageDropInput = {
      systemType: systemType as SystemType,
      sourceVoltage: voltage,
      material: material as ConductorMaterial,
      wireSize: wireSize as WireSize,
      loadCurrent: current,
      distance: dist,
      unitSystem: unitSystem as UnitSystem,
      parallelConductors: parseInt(parallelConductors),
    };

    const calcResult = calculateVoltageDrop(input);
    if (isPro && calcResult && !('error' in calcResult)) {
      addEntry({
        calculatorId: 'voltage-drop',
        inputSummary: `#${wireSize} ${current}A ${dist}${unitSystem === 'imperial' ? 'ft' : 'm'}`,
        resultPreview: `${calcResult.voltageDropPercent}%`,
      });
    }

    calculate(input);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <CalculatorCard>
        <PickerSelect label="System Type" options={systemTypeOptions} selectedValue={systemType} onValueChange={setSystemType} />
        <PickerSelect label="Source Voltage" options={voltagePresets} selectedValue={sourceVoltage} onValueChange={setSourceVoltage} />
        <PickerSelect label="Conductor Material" options={materialOptions} selectedValue={material} onValueChange={setMaterial} />
        <PickerSelect label="Wire Size" options={wireSizeOptions} selectedValue={wireSize} onValueChange={setWireSize} />
        <NumberInput label="Load Current" value={loadCurrent} onChangeText={setLoadCurrent} suffix="A" placeholder="Enter amps" />
        <PickerSelect label="Unit System" options={unitOptions} selectedValue={unitSystem} onValueChange={setUnitSystem} />
        <NumberInput label="One-Way Distance" value={distance} onChangeText={setDistance} suffix={unitSystem === 'imperial' ? 'ft' : 'm'} placeholder="Enter distance" />
        <PickerSelect label="Parallel Conductors per Phase" options={parallelOptions} selectedValue={parallelConductors} onValueChange={setParallelConductors} />
      </CalculatorCard>

      <TouchableOpacity style={styles.calculateButton} onPress={handleCalculate}>
        <Text style={styles.calculateButtonText}>Calculate</Text>
      </TouchableOpacity>

      {error && (
        <CalculatorCard>
          <Text style={styles.errorText}>{error}</Text>
        </CalculatorCard>
      )}

      <SoftLockOverlay isLocked={!isPro}>
        {result && (
          <CalculatorCard>
            <ResultDisplay
              label="Voltage Drop"
              value={`${result.voltageDrop}V (${result.voltageDropPercent}%)`}
              status={result.status}
            />
            <View style={styles.detailRow}>
              <Text style={Typography.bodySecondary}>Voltage at load:</Text>
              <Text style={Typography.body}>{result.voltageAtLoad}V</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={Typography.bodySecondary}>Status:</Text>
              <Text style={[Typography.body, {
                color: result.status === 'pass' ? Colors.success : result.status === 'warning' ? Colors.warning : Colors.error,
              }]}>{result.statusLabel}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={Typography.bodySecondary}>Max distance for 3%:</Text>
              <Text style={Typography.body}>{result.maxRecommendedDistance} {result.distanceUnit}</Text>
            </View>
            <Text style={[Typography.cecReference, { marginTop: 12, textAlign: 'center' }]}>
              {result.cecReference}
            </Text>
          </CalculatorCard>
        )}
      </SoftLockOverlay>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 32 },
  calculateButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
    }),
  },
  calculateButtonText: { color: Colors.buttonText, fontSize: 18, fontWeight: '700' },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  errorText: { color: Colors.error, fontSize: 16, textAlign: 'center' },
});

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet, Platform } from 'react-native';
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
import { calculateBoxFill, BoxFillInput, BoxFillResult, BoxFillWireEntry } from '../../../utils/box-fill';
import { BoxFillWireSize, boxFillWireSizes } from '../../../data/box-fill-data';

const wireSizeOptions = boxFillWireSizes.map((w) => ({ label: `#${w} AWG`, value: w }));

export default function BoxFillScreen() {
  const { isPro, isLoading } = useProStatus();
  const { addEntry } = useCalculationHistory();

  const [wireEntries, setWireEntries] = useState<Record<BoxFillWireSize, { insulated: string; passThrough: string }>>({
    '14': { insulated: '', passThrough: '' },
    '12': { insulated: '', passThrough: '' },
    '10': { insulated: '', passThrough: '' },
    '8': { insulated: '', passThrough: '' },
    '6': { insulated: '', passThrough: '' },
  });

  const [connectorPairs, setConnectorPairs] = useState('');
  const [largestConnectorWire, setLargestConnectorWire] = useState<string>('12');
  const [devices, setDevices] = useState('');
  const [largestDeviceWire, setLargestDeviceWire] = useState<string>('12');
  const [fixtureStuds, setFixtureStuds] = useState('');
  const [largestStudWire, setLargestStudWire] = useState<string>('12');
  const [hasEGC, setHasEGC] = useState(false);
  const [largestEGCWire, setLargestEGCWire] = useState<string>('14');
  const [hasDeepDevice, setHasDeepDevice] = useState(false);
  const [deepDeviceDepth, setDeepDeviceDepth] = useState('');
  const [boxVolume, setBoxVolume] = useState('');

  const { result, error, calculate } = useCalculation<BoxFillInput, BoxFillResult>(
    calculateBoxFill,
  );

  const updateWireEntry = (size: BoxFillWireSize, field: 'insulated' | 'passThrough', value: string) => {
    setWireEntries((prev) => ({
      ...prev,
      [size]: { ...prev[size], [field]: value },
    }));
  };

  const handleCalculate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const wires: BoxFillWireEntry[] = boxFillWireSizes.map((size) => ({
      wireSize: size,
      insulatedWires: parseInt(wireEntries[size].insulated) || 0,
      passThroughWires: parseInt(wireEntries[size].passThrough) || 0,
    }));

    const input: BoxFillInput = {
      wires,
      wireConnectorPairs: parseInt(connectorPairs) || 0,
      largestConnectorWire: largestConnectorWire as BoxFillWireSize,
      devices: parseInt(devices) || 0,
      largestDeviceWire: largestDeviceWire as BoxFillWireSize,
      fixtureStuds: parseInt(fixtureStuds) || 0,
      largestStudWire: largestStudWire as BoxFillWireSize,
      hasEGC,
      largestEGCWire: largestEGCWire as BoxFillWireSize,
      hasDeepDevice,
      deepDeviceDepthCm: parseFloat(deepDeviceDepth) || 0,
      boxVolume: parseFloat(boxVolume) || undefined,
    };

    const calcResult = calculateBoxFill(input);
    if (isPro && calcResult && !('error' in calcResult)) {
      addEntry({
        calculatorId: 'box-fill',
        inputSummary: `Box fill calculation`,
        resultPreview: `${calcResult.totalRequiredVolume} mL`,
      });
    }

    calculate(input);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <CalculatorCard>
        <Text style={Typography.subtitle}>Conductors</Text>
        {boxFillWireSizes.map((size) => (
          <View key={size} style={styles.wireGroup}>
            <Text style={[Typography.label, { marginBottom: 4 }]}>#{size} AWG</Text>
            <View style={styles.wireInputRow}>
              <View style={styles.wireInputHalf}>
                <NumberInput label="Insulated" value={wireEntries[size].insulated} onChangeText={(v) => updateWireEntry(size, 'insulated', v)} placeholder="0" />
              </View>
              <View style={styles.wireInputHalf}>
                <NumberInput label="Pass-through" value={wireEntries[size].passThrough} onChangeText={(v) => updateWireEntry(size, 'passThrough', v)} placeholder="0" />
              </View>
            </View>
          </View>
        ))}
      </CalculatorCard>

      <CalculatorCard>
        <Text style={Typography.subtitle}>Allowances</Text>
        <View style={styles.allowanceRow}>
          <View style={{ flex: 1 }}>
            <NumberInput label="Wire connector pairs" value={connectorPairs} onChangeText={setConnectorPairs} placeholder="0" />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <PickerSelect label="Largest wire" options={wireSizeOptions} selectedValue={largestConnectorWire} onValueChange={setLargestConnectorWire} />
          </View>
        </View>
        <View style={styles.allowanceRow}>
          <View style={{ flex: 1 }}>
            <NumberInput label="Devices" value={devices} onChangeText={setDevices} placeholder="0" />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <PickerSelect label="Largest wire" options={wireSizeOptions} selectedValue={largestDeviceWire} onValueChange={setLargestDeviceWire} />
          </View>
        </View>
        <View style={styles.allowanceRow}>
          <View style={{ flex: 1 }}>
            <NumberInput label="Fixture studs" value={fixtureStuds} onChangeText={setFixtureStuds} placeholder="0" />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <PickerSelect label="Largest wire" options={wireSizeOptions} selectedValue={largestStudWire} onValueChange={setLargestStudWire} />
          </View>
        </View>
      </CalculatorCard>

      <CalculatorCard>
        <View style={styles.switchRow}>
          <Text style={Typography.body}>Equipment Grounding Conductors</Text>
          <Switch value={hasEGC} onValueChange={setHasEGC} trackColor={{ false: Colors.border, true: Colors.primary }} thumbColor={hasEGC ? Colors.accent : Colors.textSecondary} />
        </View>
        {hasEGC && (
          <PickerSelect label="Largest EGC" options={wireSizeOptions} selectedValue={largestEGCWire} onValueChange={setLargestEGCWire} />
        )}
        <View style={[styles.switchRow, { marginTop: 12 }]}>
          <Text style={Typography.body}>Deep Device Present</Text>
          <Switch value={hasDeepDevice} onValueChange={setHasDeepDevice} trackColor={{ false: Colors.border, true: Colors.primary }} thumbColor={hasDeepDevice ? Colors.accent : Colors.textSecondary} />
        </View>
        {hasDeepDevice && (
          <NumberInput label="Device depth" value={deepDeviceDepth} onChangeText={setDeepDeviceDepth} suffix="cm" placeholder="0" />
        )}
      </CalculatorCard>

      <CalculatorCard>
        <NumberInput label="Box Volume (optional)" value={boxVolume} onChangeText={setBoxVolume} suffix="mL" placeholder="Enter box volume" />
      </CalculatorCard>

      <TouchableOpacity style={styles.calculateButton} onPress={handleCalculate}>
        <Text style={styles.calculateButtonText}>Calculate</Text>
      </TouchableOpacity>

      {error && (
        <CalculatorCard>
          <Text style={styles.errorText}>{error}</Text>
        </CalculatorCard>
      )}

      <SoftLockOverlay isLocked={!isPro} isLoading={isLoading}>
        {result && (
          <CalculatorCard>
            <ResultDisplay label="Total Required Volume" value={`${result.totalRequiredVolume} mL`} />
            {result.breakdown.map((item, index) => (
              <View key={index} style={styles.detailRow}>
                <Text style={Typography.bodySecondary}>{item.description} ({item.count}×{item.volumeEach})</Text>
                <Text style={Typography.body}>{item.totalVolume.toFixed(1)} mL</Text>
              </View>
            ))}
            {result.deepDeviceReduction > 0 && (
              <View style={styles.detailRow}>
                <Text style={Typography.bodySecondary}>Deep device reduction:</Text>
                <Text style={[Typography.body, { color: Colors.error }]}>-{result.deepDeviceReduction} mL</Text>
              </View>
            )}
            {result.suitableBoxes.length > 0 && (
              <View>
                <Text style={[Typography.subtitle, { marginTop: 12, marginBottom: 8 }]}>Suitable Standard Boxes</Text>
                {result.suitableBoxes.slice(0, 5).map((box, index) => (
                  <View key={index} style={styles.boxRow}>
                    <Text style={Typography.bodySecondary}>{box.name}</Text>
                    <Text style={Typography.body}>{box.volume} mL</Text>
                  </View>
                ))}
              </View>
            )}
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
  wireGroup: { marginBottom: 8 },
  wireInputRow: { flexDirection: 'row', gap: 8 },
  wireInputHalf: { flex: 1 },
  allowanceRow: { flexDirection: 'row', alignItems: 'flex-start' },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
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
  boxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  errorText: { color: Colors.error, fontSize: 16, textAlign: 'center' },
});

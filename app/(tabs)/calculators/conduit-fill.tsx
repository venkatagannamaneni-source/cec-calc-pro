import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
import {
  calculateConduitFill,
  ConduitFillInput,
  ConduitFillResult,
  WireEntry,
} from '../../../utils/conduit-fill';
import { WireSize } from '../../../data/cec-tables';
import {
  ConduitType,
  InsulationType,
  TradeSize,
  conduitTypes,
  tradeSizes,
  insulationTypes,
  conduitFillWireSizes,
} from '../../../data/conduit-data';

const conduitTypeOptions = conduitTypes.map((t) => ({ label: t, value: t }));
const tradeSizeOptions = tradeSizes.map((t) => ({ label: t, value: t }));
const insulationTypeOptions = insulationTypes.map((t) => ({ label: t, value: t }));
const wireSizeOptions = conduitFillWireSizes.map((w) => ({ label: `#${w} AWG`, value: w }));

interface WireRow {
  wireSize: string;
  insulationType: string;
  quantity: string;
}

export default function ConduitFillScreen() {
  const { isPro, isLoading } = useProStatus();
  const { addEntry } = useCalculationHistory();
  const [conduitType, setConduitType] = useState<string>('EMT');
  const [tradeSize, setTradeSize] = useState<string>('1/2"');
  const [wireRows, setWireRows] = useState<WireRow[]>([
    { wireSize: '12', insulationType: 'RW90 XLPE', quantity: '' },
  ]);

  const { result, error, calculate } = useCalculation<ConduitFillInput, ConduitFillResult>(
    calculateConduitFill,
  );

  const updateRow = (index: number, field: keyof WireRow, value: string) => {
    const updated = [...wireRows];
    updated[index] = { ...updated[index], [field]: value };
    setWireRows(updated);
  };

  const addRow = () => {
    setWireRows([...wireRows, { wireSize: '12', insulationType: 'RW90 XLPE', quantity: '' }]);
  };

  const removeRow = (index: number) => {
    if (wireRows.length <= 1) return;
    setWireRows(wireRows.filter((_, i) => i !== index));
  };

  const handleCalculate = () => {
    const wires: WireEntry[] = wireRows
      .filter((r) => parseInt(r.quantity) > 0)
      .map((r) => ({
        wireSize: r.wireSize as WireSize,
        insulationType: r.insulationType as InsulationType,
        quantity: parseInt(r.quantity),
      }));

    if (wires.length === 0) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const input: ConduitFillInput = {
      conduitType: conduitType as ConduitType,
      tradeSize: tradeSize as TradeSize,
      wires,
    };

    const calcResult = calculateConduitFill(input);
    if (isPro && calcResult && !('error' in calcResult)) {
      const totalWires = wires.reduce((sum, w) => sum + w.quantity, 0);
      addEntry({
        calculatorId: 'conduit-fill',
        inputSummary: `${totalWires} wires in ${tradeSize} ${conduitType}`,
        resultPreview: `${calcResult.fillPercent}%`,
      });
    }

    calculate(input);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <CalculatorCard>
        <PickerSelect label="Conduit Type" options={conduitTypeOptions} selectedValue={conduitType} onValueChange={setConduitType} />
        <PickerSelect label="Trade Size" options={tradeSizeOptions} selectedValue={tradeSize} onValueChange={setTradeSize} />
      </CalculatorCard>

      {wireRows.map((row, index) => (
        <CalculatorCard key={index}>
          <View style={styles.wireRowHeader}>
            <Text style={Typography.subtitle}>Wire #{index + 1}</Text>
            {wireRows.length > 1 && (
              <TouchableOpacity onPress={() => removeRow(index)}>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
          <PickerSelect label="Wire Size" options={wireSizeOptions} selectedValue={row.wireSize} onValueChange={(v) => updateRow(index, 'wireSize', v)} />
          <PickerSelect label="Insulation" options={insulationTypeOptions} selectedValue={row.insulationType} onValueChange={(v) => updateRow(index, 'insulationType', v)} />
          <NumberInput label="Quantity" value={row.quantity} onChangeText={(v) => updateRow(index, 'quantity', v)} placeholder="0" />
        </CalculatorCard>
      ))}

      <TouchableOpacity style={styles.addButton} onPress={addRow} activeOpacity={0.7}>
        <MaterialCommunityIcons name="plus-circle-outline" size={18} color={Colors.primary} style={{ marginRight: 6 }} />
        <Text style={styles.addButtonText}>Add Wire</Text>
      </TouchableOpacity>

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
            <ResultDisplay
              label="Conduit Fill"
              value={`${result.fillPercent}%`}
              status={result.status === 'pass' ? 'pass' : 'fail'}
            />
            <View style={styles.detailRow}>
              <Text style={Typography.bodySecondary}>Total wire area:</Text>
              <Text style={Typography.body}>{result.totalWireArea} mm²</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={Typography.bodySecondary}>Conduit area:</Text>
              <Text style={Typography.body}>{result.conduitArea} mm²</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={Typography.bodySecondary}>Max fill allowed:</Text>
              <Text style={Typography.body}>{result.maxFillPercent}%</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={Typography.bodySecondary}>Remaining capacity:</Text>
              <Text style={[Typography.body, { color: result.remainingCapacity >= 0 ? Colors.success : Colors.error }]}>
                {result.remainingCapacity} mm²
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={Typography.bodySecondary}>Total conductors:</Text>
              <Text style={Typography.body}>{result.totalConductors}</Text>
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
  wireRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  removeText: { color: Colors.error, fontSize: 14 },
  addButton: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  addButtonText: { color: Colors.primary, fontSize: 16, fontWeight: '600' },
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

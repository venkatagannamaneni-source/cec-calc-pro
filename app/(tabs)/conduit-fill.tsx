// Conduit Fill Calculator (PRO) — CEC 2021 Rule 12-910, Tables 6/8/9
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { CalculatorCard } from '../../components/CalculatorCard';
import { ResultDisplay } from '../../components/ResultDisplay';
import { PickerSelect } from '../../components/PickerSelect';
import { NumberInput } from '../../components/NumberInput';
import { ProBadge } from '../../components/ProBadge';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useProStatus } from '../../hooks/useProStatus';
import { useCalculation } from '../../hooks/useCalculation';
import {
  calculateConduitFill,
  ConduitFillInput,
  ConduitFillResult,
  WireEntry,
} from '../../utils/conduit-fill';
import { WireSize } from '../../data/cec-tables';
import {
  ConduitType,
  InsulationType,
  TradeSize,
  conduitTypes,
  tradeSizes,
  insulationTypes,
  conduitFillWireSizes,
} from '../../data/conduit-data';

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
  const { isPro } = useProStatus();
  const [conduitType, setConduitType] = useState<string>('EMT');
  const [tradeSize, setTradeSize] = useState<string>('1/2"');
  const [wireRows, setWireRows] = useState<WireRow[]>([
    { wireSize: '12', insulationType: 'RW90 XLPE', quantity: '' },
  ]);

  const { result, error, calculate } = useCalculation<ConduitFillInput, ConduitFillResult>(
    calculateConduitFill,
  );

  if (!isPro) {
    return <ProBadge isPro={false}><View /></ProBadge>;
  }

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

    calculate({
      conduitType: conduitType as ConduitType,
      tradeSize: tradeSize as TradeSize,
      wires,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={Typography.title}>Conduit Fill Calculator</Text>
        <Text style={Typography.cecReference}>CEC 2021 Rule 12-910, Tables 6/8/9</Text>
      </View>

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

      <TouchableOpacity style={styles.addButton} onPress={addRow}>
        <Text style={styles.addButtonText}>+ Add Wire</Text>
      </TouchableOpacity>

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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 32 },
  header: { marginBottom: 16 },
  wireRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  removeText: { color: Colors.error, fontSize: 14 },
  addButton: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: { color: Colors.primary, fontSize: 16, fontWeight: '600' },
  calculateButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  calculateButtonText: { color: Colors.buttonText, fontSize: 18, fontWeight: '700' },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  errorText: { color: Colors.error, fontSize: 16, textAlign: 'center' },
});

// Imperial/Metric Converter (FREE)
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { CalculatorCard } from '../../components/CalculatorCard';
import { NumberInput } from '../../components/NumberInput';
import { PickerSelect } from '../../components/PickerSelect';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { conversions, ConversionCategory } from '../../utils/conversions';

const categoryOptions: { label: string; value: ConversionCategory }[] = [
  { label: 'Length', value: 'length' },
  { label: 'Area', value: 'area' },
  { label: 'Volume', value: 'volume' },
  { label: 'Weight', value: 'weight' },
  { label: 'Temperature', value: 'temperature' },
  { label: 'Electrical', value: 'electrical' },
];

export default function ConverterScreen() {
  const [category, setCategory] = useState<ConversionCategory>('length');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imperialValue, setImperialValue] = useState('');
  const [metricValue, setMetricValue] = useState('');

  const filteredConversions = conversions.filter((c) => c.category === category);

  const conversionOptions = filteredConversions.map((c, i) => ({
    label: c.label,
    value: String(i),
  }));

  const currentConversion = filteredConversions[selectedIndex];

  const handleCategoryChange = useCallback((value: string) => {
    setCategory(value as ConversionCategory);
    setSelectedIndex(0);
    setImperialValue('');
    setMetricValue('');
  }, []);

  const handleConversionChange = useCallback((value: string) => {
    setSelectedIndex(parseInt(value));
    setImperialValue('');
    setMetricValue('');
  }, []);

  const handleImperialChange = useCallback(
    (text: string) => {
      setImperialValue(text);
      const num = parseFloat(text);
      if (!isNaN(num) && currentConversion) {
        const result = currentConversion.toMetric(num);
        setMetricValue(String(Math.round(result * 10000) / 10000));
      } else {
        setMetricValue('');
      }
    },
    [currentConversion],
  );

  const handleMetricChange = useCallback(
    (text: string) => {
      setMetricValue(text);
      const num = parseFloat(text);
      if (!isNaN(num) && currentConversion) {
        const result = currentConversion.toImperial(num);
        setImperialValue(String(Math.round(result * 10000) / 10000));
      } else {
        setImperialValue('');
      }
    },
    [currentConversion],
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={Typography.title}>Imperial / Metric Converter</Text>
      </View>

      <CalculatorCard>
        <PickerSelect
          label="Category"
          options={categoryOptions}
          selectedValue={category}
          onValueChange={handleCategoryChange}
        />
        {conversionOptions.length > 1 && (
          <PickerSelect
            label="Conversion"
            options={conversionOptions}
            selectedValue={String(selectedIndex)}
            onValueChange={handleConversionChange}
          />
        )}
      </CalculatorCard>

      {currentConversion && (
        <CalculatorCard>
          <NumberInput
            label={`Imperial (${currentConversion.imperialUnit})`}
            value={imperialValue}
            onChangeText={handleImperialChange}
            suffix={currentConversion.imperialUnit}
          />
          <View style={styles.arrowContainer}>
            <Text style={styles.arrow}>&#8597;</Text>
          </View>
          <NumberInput
            label={`Metric (${currentConversion.metricUnit})`}
            value={metricValue}
            onChangeText={handleMetricChange}
            suffix={currentConversion.metricUnit}
          />
        </CalculatorCard>
      )}
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
  arrowContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  arrow: {
    fontSize: 24,
    color: Colors.accent,
  },
});

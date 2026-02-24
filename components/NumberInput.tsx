// Numeric input with validation
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';

interface NumberInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  suffix?: string;
  min?: number;
  max?: number;
}

export function NumberInput({
  label,
  value,
  onChangeText,
  placeholder = '0',
  suffix,
}: NumberInputProps) {
  return (
    <View style={styles.container}>
      <Text style={Typography.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textSecondary}
          keyboardType="decimal-pad"
          returnKeyType="done"
        />
        {suffix && <Text style={styles.suffix}>{suffix}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.inputBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 48,
    color: Colors.textPrimary,
    fontSize: 18,
  },
  suffix: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginLeft: 8,
  },
});

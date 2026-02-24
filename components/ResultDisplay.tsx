// Styled result display with CEC rule reference
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';

interface ResultDisplayProps {
  label: string;
  value: string;
  cecReference?: string;
  status?: 'pass' | 'warning' | 'fail';
}

export function ResultDisplay({ label, value, cecReference, status }: ResultDisplayProps) {
  const valueColor = status === 'fail'
    ? Colors.error
    : status === 'warning'
      ? Colors.warning
      : Colors.accent;

  return (
    <View style={styles.container}>
      <Text style={Typography.resultLabel}>{label}</Text>
      <Text style={[Typography.result, { color: valueColor }]}>{value}</Text>
      {cecReference && <Text style={Typography.cecReference}>{cecReference}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
});

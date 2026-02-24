// Reusable calculator input/output card
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../constants/colors';

interface CalculatorCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CalculatorCard({ children, style }: CalculatorCardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
});

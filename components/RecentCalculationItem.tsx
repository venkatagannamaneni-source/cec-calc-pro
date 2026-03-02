import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import type { AppIconName } from '../data/calculator-registry';

interface RecentCalculationItemProps {
  calculatorName: string;
  calculatorIcon: AppIconName;
  resultPreview: string;
  timestamp: number;
  onPress: () => void;
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

export function RecentCalculationItem({ calculatorName, calculatorIcon, resultPreview, timestamp, onPress }: RecentCalculationItemProps): React.ReactElement {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <MaterialCommunityIcons name={calculatorIcon} size={20} color={Colors.accent} />
      <View style={styles.textContainer}>
        <Text style={styles.name} numberOfLines={1}>{calculatorName}</Text>
        <Text style={styles.timestamp}>{formatRelativeTime(timestamp)}</Text>
      </View>
      <Text style={styles.result} numberOfLines={1}>{resultPreview}</Text>
      <MaterialCommunityIcons name="chevron-right" size={16} color={Colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  timestamp: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  result: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accent,
    marginRight: 6,
  },
});

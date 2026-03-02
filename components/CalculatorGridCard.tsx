import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import type { AppIconName } from '../data/calculator-registry';

interface CalculatorGridCardProps {
  name: string;
  description: string;
  icon: AppIconName;
  tier: 'free' | 'pro';
  onPress: () => void;
}

export function CalculatorGridCard({ name, description, icon, tier, onPress }: CalculatorGridCardProps): React.ReactElement {
  const isTierPro = tier === 'pro';
  const badgeLabel = isTierPro ? 'PRO' : 'FREE';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.6}>
      <View style={styles.topRow}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name={icon} size={24} color={Colors.accent} />
        </View>
        <View style={[styles.badge, isTierPro ? styles.proBadge : styles.freeBadge]}>
          {isTierPro && (
            <MaterialCommunityIcons name="lock" size={10} color={Colors.background} style={{ marginRight: 3 }} />
          )}
          <Text style={styles.badgeText}>{badgeLabel}</Text>
        </View>
      </View>
      <Text style={styles.name} numberOfLines={1}>{name}</Text>
      <Text style={styles.description} numberOfLines={2}>{description}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 130,
    flex: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
    }),
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  freeBadge: {
    backgroundColor: Colors.success,
  },
  proBadge: {
    backgroundColor: Colors.proBadge,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.background,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});

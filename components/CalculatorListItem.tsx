import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import type { AppIconName } from '../data/calculator-registry';

interface CalculatorListItemProps {
  name: string;
  description: string;
  icon: AppIconName;
  cecReference: string;
  tier: 'free' | 'pro' | 'coming-soon';
  onPress: () => void;
}

export function CalculatorListItem({ name, description, icon, cecReference, tier, onPress }: CalculatorListItemProps): React.ReactElement {
  const isComingSoon = tier === 'coming-soon';

  function renderBadge(): React.ReactElement {
    if (isComingSoon) {
      return (
        <View style={styles.comingSoonBadge}>
          <Text style={styles.comingSoonText}>Soon</Text>
        </View>
      );
    }

    const isTierPro = tier === 'pro';
    return (
      <>
        <View style={[styles.badge, isTierPro ? styles.proBadge : styles.freeBadge]}>
          {isTierPro && (
            <MaterialCommunityIcons name="lock" size={10} color={Colors.background} style={{ marginRight: 3 }} />
          )}
          <Text style={styles.badgeText}>{isTierPro ? 'PRO' : 'FREE'}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.textSecondary} />
      </>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, isComingSoon && styles.dimmed]}
      onPress={onPress}
      activeOpacity={isComingSoon ? 1 : 0.6}
      disabled={isComingSoon}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name={icon} size={24} color={Colors.accent} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={styles.description} numberOfLines={2}>{description}</Text>
        {cecReference && <Text style={styles.cecRef}>{cecReference}</Text>}
      </View>
      <View style={styles.rightContainer}>
        {renderBadge()}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dimmed: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 2,
  },
  cecRef: {
    fontSize: 11,
    color: Colors.success,
    fontStyle: 'italic',
  },
  rightContainer: {
    alignItems: 'flex-end',
    gap: 6,
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
  comingSoonBadge: {
    backgroundColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  comingSoonText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});

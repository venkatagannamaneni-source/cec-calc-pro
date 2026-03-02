import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface CalculatorListItemProps {
  name: string;
  description: string;
  icon: string;
  cecReference: string;
  tier: 'free' | 'pro' | 'coming-soon';
  onPress: () => void;
}

export function CalculatorListItem({ name, description, icon, cecReference, tier, onPress }: CalculatorListItemProps) {
  const isComingSoon = tier === 'coming-soon';

  return (
    <TouchableOpacity
      style={[styles.container, isComingSoon && styles.dimmed]}
      onPress={onPress}
      activeOpacity={isComingSoon ? 1 : 0.7}
      disabled={isComingSoon}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name={icon as any} size={24} color={Colors.accent} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={styles.description} numberOfLines={2}>{description}</Text>
        {cecReference !== '' && (
          <Text style={styles.cecRef}>{cecReference}</Text>
        )}
      </View>
      <View style={styles.rightContainer}>
        {tier === 'coming-soon' ? (
          <View style={styles.comingSoonBadge}>
            <Text style={styles.comingSoonText}>Soon</Text>
          </View>
        ) : (
          <>
            <View style={[styles.badge, tier === 'pro' ? styles.proBadge : styles.freeBadge]}>
              {tier === 'pro' && (
                <MaterialCommunityIcons name="lock" size={9} color={Colors.surface} style={{ marginRight: 2 }} />
              )}
              <Text style={styles.badgeText}>{tier === 'pro' ? 'PRO' : 'FREE'}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.textSecondary} />
          </>
        )}
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
    borderRadius: 22,
    backgroundColor: Colors.surface,
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
    color: Colors.primary,
    fontStyle: 'italic',
  },
  rightContainer: {
    alignItems: 'flex-end',
    gap: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  freeBadge: {
    backgroundColor: Colors.success,
  },
  proBadge: {
    backgroundColor: Colors.proBadge,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.surface,
  },
  comingSoonBadge: {
    backgroundColor: Colors.border,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  comingSoonText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});

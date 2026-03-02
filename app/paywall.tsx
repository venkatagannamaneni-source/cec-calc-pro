// RevenueCat Paywall Screen
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';

export default function PaywallScreen() {
  const router = useRouter();

  const handlePurchase = (plan: 'monthly' | 'annual') => {
    Alert.alert(
      'Coming Soon',
      'In-app purchases will be available when the app is published to the store.',
      [{ text: 'OK' }],
    );
  };

  const handleRestore = () => {
    Alert.alert(
      'Restore Purchases',
      'Purchase restoration will be available when the app is published.',
      [{ text: 'OK' }],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="close" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.badge}>PRO</Text>
          <Text style={Typography.title}>Unlock All Calculators</Text>
          <Text style={[Typography.bodySecondary, { textAlign: 'center', marginTop: 8 }]}>
            Get access to Voltage Drop, Conduit Fill, and Box Fill calculators
          </Text>
        </View>

        <View style={styles.features}>
          <FeatureRow icon="check-circle" text="Wire Sizing Calculator" free />
          <FeatureRow icon="check-circle" text="Imperial/Metric Converter" free />
          <FeatureRow icon="star" text="Voltage Drop Calculator" />
          <FeatureRow icon="star" text="Conduit Fill Calculator" />
          <FeatureRow icon="star" text="Box Fill Calculator" />
          <FeatureRow icon="star" text="Future calculators included" />
        </View>

        <View style={styles.plans}>
          <TouchableOpacity
            style={styles.planCard}
            onPress={() => handlePurchase('monthly')}
            activeOpacity={0.7}
          >
            <Text style={styles.planTitle}>Monthly</Text>
            <Text style={styles.planPrice}>$4.99/mo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.planCard, styles.planCardHighlighted]}
            onPress={() => handlePurchase('annual')}
            activeOpacity={0.7}
          >
            <Text style={styles.saveBadge}>Save 50%</Text>
            <Text style={styles.planTitle}>Annual</Text>
            <Text style={styles.planPrice}>$29.99/yr</Text>
            <Text style={styles.planSubtext}>$2.50/mo</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleRestore} activeOpacity={0.7}>
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function FeatureRow({ icon, text, free }: { icon: string; text: string; free?: boolean }) {
  return (
    <View style={styles.featureRow}>
      <MaterialCommunityIcons
        name={icon as any}
        size={20}
        color={free ? Colors.success : Colors.proBadge}
      />
      <Text style={[Typography.body, { marginLeft: 12, flex: 1 }]}>{text}</Text>
      {free && <Text style={styles.freeTag}>FREE</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 24,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  badge: {
    backgroundColor: Colors.proBadge,
    color: Colors.background,
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 16,
    overflow: 'hidden',
  },
  features: {
    marginBottom: 32,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  freeTag: {
    fontSize: 11,
    color: Colors.success,
    fontWeight: '600',
  },
  plans: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  planCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  planCardHighlighted: {
    borderColor: Colors.proBadge,
    borderWidth: 2,
  },
  saveBadge: {
    backgroundColor: Colors.proBadge,
    color: Colors.background,
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  planTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  planPrice: {
    color: Colors.accent,
    fontSize: 22,
    fontWeight: '700',
  },
  planSubtext: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
  },
  restoreText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

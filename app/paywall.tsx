// RevenueCat Paywall Screen
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';

export default function PaywallScreen() {
  const router = useRouter();

  const handlePurchase = (plan: 'monthly' | 'annual') => {
    // RevenueCat purchase — uncomment when API keys are configured
    // try {
    //   const Purchases = (await import('react-native-purchases')).default;
    //   const offerings = await Purchases.getOfferings();
    //   const pkg = plan === 'monthly'
    //     ? offerings.current?.monthly
    //     : offerings.current?.annual;
    //   if (pkg) {
    //     await Purchases.purchasePackage(pkg);
    //     router.back();
    //   }
    // } catch (e) { /* handle error */ }

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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.badge}>PRO</Text>
        <Text style={Typography.title}>Unlock All Calculators</Text>
        <Text style={[Typography.bodySecondary, { textAlign: 'center', marginTop: 8 }]}>
          Get access to Voltage Drop, Conduit Fill, and Box Fill calculators
        </Text>
      </View>

      <View style={styles.features}>
        <FeatureRow icon="✓" text="Wire Sizing Calculator" free />
        <FeatureRow icon="✓" text="Imperial/Metric Converter" free />
        <FeatureRow icon="★" text="Voltage Drop Calculator" />
        <FeatureRow icon="★" text="Conduit Fill Calculator" />
        <FeatureRow icon="★" text="Box Fill Calculator" />
        <FeatureRow icon="★" text="Future calculators included" />
      </View>

      <View style={styles.plans}>
        <TouchableOpacity
          style={styles.planCard}
          onPress={() => handlePurchase('monthly')}
        >
          <Text style={styles.planTitle}>Monthly</Text>
          <Text style={styles.planPrice}>$4.99/mo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.planCard, styles.planCardHighlighted]}
          onPress={() => handlePurchase('annual')}
        >
          <Text style={styles.saveBadge}>Save 50%</Text>
          <Text style={styles.planTitle}>Annual</Text>
          <Text style={styles.planPrice}>$29.99/yr</Text>
          <Text style={styles.planSubtext}>$2.50/mo</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleRestore}>
        <Text style={styles.restoreText}>Restore Purchases</Text>
      </TouchableOpacity>
    </View>
  );
}

function FeatureRow({ icon, text, free }: { icon: string; text: string; free?: boolean }) {
  return (
    <View style={styles.featureRow}>
      <Text style={[styles.featureIcon, { color: free ? Colors.success : Colors.proBadge }]}>
        {icon}
      </Text>
      <Text style={Typography.body}>{text}</Text>
      {free && <Text style={styles.freeTag}>FREE</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 24,
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
    paddingVertical: 8,
  },
  featureIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  freeTag: {
    marginLeft: 'auto',
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

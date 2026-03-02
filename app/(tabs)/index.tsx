import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CalculatorGridCard } from '../../components/CalculatorGridCard';
import { RecentCalculationItem } from '../../components/RecentCalculationItem';
import { QuickReferenceCard } from '../../components/QuickReferenceCard';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useProStatus } from '../../hooks/useProStatus';
import { useCalculationHistory } from '../../hooks/useCalculationHistory';
import { CALCULATORS, getCalculatorById } from '../../data/calculator-registry';
import { QUICK_REFERENCES } from '../../data/quick-reference';

export default function HomeScreen(): React.ReactElement {
  const router = useRouter();
  const { isPro } = useProStatus();
  const { getRecent } = useCalculationHistory();

  const recentCalcs = getRecent(3);

  function navigateToCalculator(id: string): void {
    router.push(`/calculators/${id}` as Href);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={Typography.title}>CEC Calc Pro</Text>
          {isPro && (
            <View style={styles.proBadge}>
              <Text style={styles.proBadgeText}>PRO</Text>
            </View>
          )}
        </View>
        <Text style={styles.subtitle}>Canadian Electrical Code 2021</Text>
      </View>

      {/* PRO Upgrade Banner (FREE users only) */}
      {!isPro && (
        <TouchableOpacity
          style={styles.upgradeBanner}
          onPress={() => router.push('/paywall')}
          activeOpacity={0.8}
        >
          <View style={styles.upgradeBannerContent}>
            <MaterialCommunityIcons name="star-circle" size={24} color={Colors.proBadge} />
            <View style={styles.upgradeBannerText}>
              <Text style={styles.upgradeBannerTitle}>Unlock all calculators</Text>
              <Text style={styles.upgradeBannerDesc}>Get voltage drop, conduit fill, box fill & more</Text>
            </View>
            <Text style={styles.upgradeButtonText}>Upgrade</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Quick Access Grid */}
      <Text style={[Typography.sectionHeader, styles.sectionTitle]}>CALCULATORS</Text>
      <View style={styles.grid}>
        {CALCULATORS.map((calc, index) => (
          <View key={calc.id} style={[styles.gridItem, index % 2 === 0 && styles.gridItemLeft]}>
            <CalculatorGridCard
              name={calc.shortName}
              description={calc.description}
              icon={calc.icon}
              tier={calc.tier}
              onPress={() => navigateToCalculator(calc.id)}
            />
          </View>
        ))}
        {CALCULATORS.length % 2 !== 0 && <View style={styles.gridItem} />}
      </View>

      {/* Recent Calculations */}
      {recentCalcs.length > 0 && (
        <>
          <Text style={[Typography.sectionHeader, styles.sectionTitle]}>RECENT CALCULATIONS</Text>
          {recentCalcs.map((entry) => {
            const calc = getCalculatorById(entry.calculatorId);
            return (
              <RecentCalculationItem
                key={entry.id}
                calculatorName={calc?.shortName ?? entry.calculatorId}
                calculatorIcon={calc?.icon ?? 'calculator'}
                resultPreview={entry.resultPreview}
                timestamp={entry.timestamp}
                onPress={() => navigateToCalculator(entry.calculatorId)}
              />
            );
          })}
        </>
      )}

      {/* Quick Reference */}
      <Text style={[Typography.sectionHeader, styles.sectionTitle]}>QUICK REFERENCE</Text>
      {QUICK_REFERENCES.map((ref, index) => (
        <QuickReferenceCard key={index} title={ref.title} items={ref.items} />
      ))}

      {/* Disclaimer */}
      <Text style={styles.disclaimer}>
        This app is a calculation aid only. Always verify calculations against the official Canadian Electrical Code. Not a substitute for professional engineering judgment.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 32 },
  header: { marginBottom: 20 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  proBadge: {
    backgroundColor: Colors.proBadge,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  proBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.surface,
  },
  upgradeBanner: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    marginBottom: 20,
    overflow: 'hidden',
  },
  upgradeBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  upgradeBannerText: {
    flex: 1,
    marginLeft: 12,
  },
  upgradeBannerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  upgradeBannerDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  upgradeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
  sectionTitle: {
    marginBottom: 10,
    paddingHorizontal: 0,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  gridItem: {
    width: '50%',
    paddingLeft: 4,
    paddingRight: 4,
    marginBottom: 8,
  },
  gridItemLeft: {
    paddingLeft: 0,
    paddingRight: 4,
  },
  disclaimer: {
    color: Colors.textSecondary,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
    lineHeight: 16,
  },
});

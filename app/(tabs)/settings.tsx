import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Linking, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CalculatorCard } from '../../components/CalculatorCard';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { useProStatus } from '../../hooks/useProStatus';
import { useCalculationHistory } from '../../hooks/useCalculationHistory';
import { useUserPreferences } from '../../hooks/useUserPreferences';
import type { AppIconName } from '../../data/calculator-registry';

interface SegmentedControlProps {
  options: Array<{ label: string; value: string }>;
  selectedValue: string;
  onValueChange: (value: string) => void;
}

function SegmentedControl({ options, selectedValue, onValueChange }: SegmentedControlProps): React.ReactElement {
  return (
    <View style={segStyles.container}>
      {options.map((opt) => {
        const isActive = opt.value === selectedValue;
        return (
          <TouchableOpacity
            key={opt.value}
            style={[segStyles.segment, isActive && segStyles.activeSegment]}
            onPress={() => onValueChange(opt.value)}
          >
            <Text style={[segStyles.label, isActive && segStyles.activeLabel]}>{opt.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const segStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.inputBackground,
    borderRadius: 10,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeSegment: {
    backgroundColor: Colors.primary,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  activeLabel: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
});

interface SettingsRowProps {
  icon: AppIconName;
  label: string;
  value?: string;
  onPress?: () => void;
}

function SettingsRow({ icon, label, value, onPress }: SettingsRowProps): React.ReactElement {
  const isClickable = !!onPress;

  return (
    <TouchableOpacity
      style={styles.settingsRow}
      onPress={onPress}
      disabled={!isClickable}
      activeOpacity={isClickable ? 0.7 : 1}
    >
      <MaterialCommunityIcons name={icon} size={20} color={Colors.textSecondary} />
      <Text style={styles.settingsRowLabel}>{label}</Text>
      {value && <Text style={styles.settingsRowValue}>{value}</Text>}
      {isClickable && <MaterialCommunityIcons name="chevron-right" size={18} color={Colors.textSecondary} />}
    </TouchableOpacity>
  );
}

export default function SettingsScreen(): React.ReactElement {
  const router = useRouter();
  const { isPro } = useProStatus();
  const { history, clearAll } = useCalculationHistory();
  const { preferences, updatePreference } = useUserPreferences();

  function handleClearHistory(): void {
    Alert.alert(
      'Clear All History',
      `Delete all ${history.length} saved calculations?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearAll },
      ],
    );
  }

  async function handleRestorePurchases(): Promise<void> {
    try {
      const Purchases = (await import('react-native-purchases')).default;
      await Purchases.restorePurchases();
      Alert.alert('Purchases Restored', 'Your purchases have been restored successfully.');
    } catch {
      Alert.alert(
        'Restore Failed',
        'Unable to restore purchases. Please ensure you are signed in to your App Store or Google Play account and try again.',
      );
    }
  }

  function openURL(url: string): void {
    Linking.openURL(url).catch(() => {
      Alert.alert('Unable to Open', 'Could not open the link. Please try again later.');
    });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Subscription Status */}
      <CalculatorCard>
        <View style={styles.subscriptionHeader}>
          <MaterialCommunityIcons
            name={isPro ? 'star-circle' : 'star-circle-outline'}
            size={32}
            color={isPro ? Colors.proBadge : Colors.textSecondary}
          />
          <View style={styles.subscriptionInfo}>
            <Text style={Typography.subtitle}>{isPro ? 'Pro Plan' : 'Free Plan'}</Text>
            <Text style={styles.subscriptionDesc}>
              {isPro ? 'All calculators unlocked' : '2 of 5 calculators available'}
            </Text>
          </View>
        </View>
        {!isPro && (
          <>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => router.push('/paywall')}
            >
              <Text style={styles.upgradeButtonText}>Upgrade to Pro</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.restoreButton} onPress={handleRestorePurchases}>
              <Text style={styles.restoreButtonText}>Restore Purchases</Text>
            </TouchableOpacity>
          </>
        )}
      </CalculatorCard>

      {/* Calculator Preferences */}
      <Text style={[Typography.sectionHeader, styles.sectionTitle]}>PREFERENCES</Text>
      <CalculatorCard>
        <Text style={styles.prefLabel}>Default Unit System</Text>
        <SegmentedControl
          options={[
            { label: 'Imperial', value: 'imperial' },
            { label: 'Metric', value: 'metric' },
          ]}
          selectedValue={preferences.unitSystem}
          onValueChange={(v) => updatePreference('unitSystem', v as 'imperial' | 'metric')}
        />
        <Text style={[styles.prefLabel, { marginTop: 16 }]}>Default Conductor Material</Text>
        <SegmentedControl
          options={[
            { label: 'Copper', value: 'copper' },
            { label: 'Aluminum', value: 'aluminum' },
          ]}
          selectedValue={preferences.defaultMaterial}
          onValueChange={(v) => updatePreference('defaultMaterial', v as 'copper' | 'aluminum')}
        />
      </CalculatorCard>

      {/* Calculation History */}
      <Text style={[Typography.sectionHeader, styles.sectionTitle]}>HISTORY</Text>
      <CalculatorCard>
        <View style={styles.historyInfo}>
          <Text style={Typography.body}>{history.length} calculations saved</Text>
        </View>
        {history.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClearHistory}>
            <MaterialCommunityIcons name="delete-outline" size={18} color={Colors.error} />
            <Text style={styles.clearButtonText}>Clear All History</Text>
          </TouchableOpacity>
        )}
      </CalculatorCard>

      {/* About */}
      <Text style={[Typography.sectionHeader, styles.sectionTitle]}>ABOUT</Text>
      <CalculatorCard>
        <SettingsRow icon="information-outline" label="App Version" value="1.0.0" />
        <SettingsRow icon="book-open-variant" label="CEC Edition" value="2021" />
      </CalculatorCard>

      {/* Legal & Support */}
      <Text style={[Typography.sectionHeader, styles.sectionTitle]}>LEGAL & SUPPORT</Text>
      <CalculatorCard>
        <SettingsRow
          icon="shield-check-outline"
          label="Legal Disclaimer"
          onPress={() => Alert.alert(
            'Legal Disclaimer',
            'This app is a calculation aid only. Always verify calculations against the official Canadian Electrical Code. Not a substitute for professional engineering judgment. The developers are not liable for any errors or omissions.',
          )}
        />
        <SettingsRow
          icon="lock-outline"
          label="Privacy Policy"
          onPress={() => openURL('https://ceccalcpro.com/privacy')}
        />
        <SettingsRow
          icon="file-document-outline"
          label="Terms of Service"
          onPress={() => openURL('https://ceccalcpro.com/terms')}
        />
        <SettingsRow
          icon="email-outline"
          label="Send Feedback"
          onPress={() => openURL('mailto:support@ceccalcpro.com')}
        />
      </CalculatorCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 32 },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 10,
    paddingHorizontal: 0,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  subscriptionInfo: {
    marginLeft: 12,
  },
  subscriptionDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  upgradeButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  upgradeButtonText: {
    color: Colors.buttonText,
    fontSize: 16,
    fontWeight: '600',
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  restoreButtonText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  prefLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  historyInfo: {
    paddingVertical: 4,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 8,
    gap: 8,
  },
  clearButtonText: {
    fontSize: 15,
    color: Colors.error,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 10,
  },
  settingsRowLabel: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  settingsRowValue: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginRight: 4,
  },
});

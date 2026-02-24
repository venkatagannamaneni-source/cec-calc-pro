// Lock icon overlay for pro features
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';

interface ProBadgeProps {
  children: React.ReactNode;
  isPro: boolean;
}

export function ProBadge({ children, isPro }: ProBadgeProps) {
  const router = useRouter();

  if (isPro) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.overlay}>
        <View style={styles.lockContainer}>
          <Text style={styles.lockIcon}>PRO</Text>
        </View>
        <Text style={styles.lockText}>Upgrade to unlock</Text>
        <TouchableOpacity
          style={styles.unlockButton}
          onPress={() => router.push('/paywall')}
        >
          <Text style={styles.unlockButtonText}>View Plans</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  overlay: {
    alignItems: 'center',
    padding: 32,
  },
  lockContainer: {
    backgroundColor: Colors.proBadge,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
  },
  lockIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.background,
  },
  lockText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  unlockButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 14,
    minWidth: 200,
    alignItems: 'center',
  },
  unlockButtonText: {
    color: Colors.buttonText,
    fontSize: 16,
    fontWeight: '600',
  },
});

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface SoftLockOverlayProps {
  isLocked: boolean;
  children: React.ReactNode;
}

export function SoftLockOverlay({ isLocked, children }: SoftLockOverlayProps) {
  const router = useRouter();

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="lock-outline" size={48} color={Colors.proBadge} />
      <Text style={styles.title}>Unlock Pro to see results</Text>
      <Text style={styles.pricing}>$4.99/mo or $29.99/yr</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/paywall')}
      >
        <Text style={styles.buttonText}>View Plans</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(18, 18, 18, 0.85)',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    minHeight: 200,
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  pricing: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 14,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.buttonText,
    fontSize: 16,
    fontWeight: '600',
  },
});

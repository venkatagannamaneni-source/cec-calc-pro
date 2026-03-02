import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface SoftLockOverlayProps {
  isLocked: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
}

export function SoftLockOverlay({ isLocked, isLoading, children }: SoftLockOverlayProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons name="lock-outline" size={32} color={Colors.proBadge} />
      </View>
      <Text style={styles.title}>Unlock Pro to see results</Text>
      <Text style={styles.pricing}>$4.99/mo or $29.99/yr</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/paywall')}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons name="star" size={18} color={Colors.buttonText} style={{ marginRight: 8 }} />
        <Text style={styles.buttonText}>View Plans</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    minHeight: 220,
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  pricing: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 32,
    paddingVertical: 14,
    minWidth: 200,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    color: Colors.buttonText,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

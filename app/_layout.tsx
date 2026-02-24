// Root layout with ProStatus provider
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ProContext, useProStatusProvider } from '../hooks/useProStatus';
import { Colors } from '../constants/colors';

export default function RootLayout() {
  const proStatus = useProStatusProvider();

  return (
    <ProContext.Provider value={proStatus}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="paywall"
          options={{
            presentation: 'modal',
            headerShown: true,
            headerTitle: 'Upgrade to Pro',
            headerStyle: { backgroundColor: Colors.surface },
            headerTintColor: Colors.textPrimary,
          }}
        />
      </Stack>
    </ProContext.Provider>
  );
}

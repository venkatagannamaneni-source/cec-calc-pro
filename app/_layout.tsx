import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ProContext, useProStatusProvider } from '../hooks/useProStatus';
import { CalculationHistoryContext, useCalculationHistoryProvider } from '../hooks/useCalculationHistory';
import { UserPreferencesContext, useUserPreferencesProvider } from '../hooks/useUserPreferences';
import { Colors } from '../constants/colors';

export default function RootLayout() {
  const proStatus = useProStatusProvider();
  const historyCtx = useCalculationHistoryProvider();
  const preferencesCtx = useUserPreferencesProvider();

  return (
    <ProContext.Provider value={proStatus}>
      <CalculationHistoryContext.Provider value={historyCtx}>
        <UserPreferencesContext.Provider value={preferencesCtx}>
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
        </UserPreferencesContext.Provider>
      </CalculationHistoryContext.Provider>
    </ProContext.Provider>
  );
}

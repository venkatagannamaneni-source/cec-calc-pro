import React from 'react';
import { Stack } from 'expo-router';
import { Colors } from '../../../constants/colors';

export default function CalculatorsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.textPrimary,
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: 'Calculators' }}
      />
      <Stack.Screen
        name="wire-sizing"
        options={{ title: 'Wire Sizing' }}
      />
      <Stack.Screen
        name="converter"
        options={{ title: 'Unit Converter' }}
      />
      <Stack.Screen
        name="voltage-drop"
        options={{ title: 'Voltage Drop' }}
      />
      <Stack.Screen
        name="conduit-fill"
        options={{ title: 'Conduit Fill' }}
      />
      <Stack.Screen
        name="box-fill"
        options={{ title: 'Box Fill' }}
      />
    </Stack>
  );
}

// Tab navigator layout
import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { Colors } from '../../constants/colors';

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 10, color: focused ? Colors.accent : Colors.textSecondary }}>
      {label}
    </Text>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.textPrimary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
        },
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textSecondary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Wire Sizing',
          tabBarIcon: ({ focused }) => <TabIcon label="Wire" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="converter"
        options={{
          title: 'Converter',
          tabBarIcon: ({ focused }) => <TabIcon label="Conv" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="voltage-drop"
        options={{
          title: 'Voltage Drop',
          tabBarIcon: ({ focused }) => <TabIcon label="VDrop" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="conduit-fill"
        options={{
          title: 'Conduit Fill',
          tabBarIcon: ({ focused }) => <TabIcon label="Cond" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="box-fill"
        options={{
          title: 'Box Fill',
          tabBarIcon: ({ focused }) => <TabIcon label="Box" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

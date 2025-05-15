import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const primaryColor = '#8844ee'; // Purple color from scan page

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: primaryColor,
        tabBarInactiveTintColor: '#777777',
        headerShown: false,
        tabBarButton: props => <HapticTab {...props} />,
        tabBarStyle: {
          backgroundColor: '#1c1c1c',
          borderTopWidth: 0,
          elevation: 0,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingTop: 8,
          paddingBottom: 8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="camera.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="chart.line.uptrend.xyaxis" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="lightbulb.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="person.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

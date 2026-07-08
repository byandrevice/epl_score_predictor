import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Theme } from '@/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // each screen renders its own header
        tabBarActiveTintColor: Theme.colors.primary,
        tabBarInactiveTintColor: Theme.colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: Theme.colors.card,
          borderTopColor: Theme.colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Fixtures',
          tabBarIcon: ({ color, size }) => <Ionicons name="football-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Leaderboard',
          tabBarIcon: ({ color, size }) => <Ionicons name="trophy-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

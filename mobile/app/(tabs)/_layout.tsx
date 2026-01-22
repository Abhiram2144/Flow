import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { AppColors } from '@/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: AppColors.accent,
        tabBarInactiveTintColor: AppColors.textTertiary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground:
          Platform.OS === 'web'
            ? undefined
            : () => (
                <BlurView intensity={90} style={StyleSheet.absoluteFill}>
                  <View style={styles.tabBarBackground} />
                </BlurView>
              ),
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}>
      <Tabs.Screen
        name="momentum"
        options={{
          title: 'Momentum',
          tabBarIcon: ({ color }) => <Ionicons size={24} name="pulse-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="home-outline" color={color} />,
          tabBarLabelStyle: styles.centerLabel,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => (
            <Ionicons size={24} name="person-circle-outline" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 24,
    left: 40,
    right: 40,
    elevation: 0,
    backgroundColor: 'transparent',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: AppColors.border,
    overflow: 'hidden',
    height: 70,
  },
  tabBarBackground: {
    backgroundColor: 'rgba(17, 20, 23, 0.9)',
  },
  tabBarLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  centerLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});

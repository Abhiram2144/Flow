import { Tabs } from 'expo-router';
import React from 'react';
import TabsAuthGuard from './TabsAuthGuard';
import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Host, HStack } from '@expo/ui/swift-ui';
import { glassEffect } from '@expo/ui/swift-ui/modifiers';

import { HapticTab } from '@/components/haptic-tab';
import { AppColors } from '@/constants/theme';

export default function TabLayout() {
  return (
    <TabsAuthGuard>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: AppColors.accent,
          tabBarInactiveTintColor: AppColors.textTertiary,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground:
            Platform.OS === 'ios'
              ? () => (
                  <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(17, 20, 23, 0.6)' }]} />
                )
              : Platform.OS === 'web'
              ? undefined
              : () => (
                  <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
                ),
          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            elevation: 0,
            borderTopWidth: 0,
            backgroundColor: Platform.OS === 'web' ? AppColors.background : 'transparent',
            height: 85,
            paddingTop: 10,
          },
          tabBarLabelStyle: styles.tabBarLabel,
        }}>
        <Tabs.Screen
          name="momentum"
          options={{
            title: 'Momentum',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                size={focused ? 32 : 24}
                name="pulse-outline"
                color={color}
                style={focused ? { textShadowColor: AppColors.accent, textShadowRadius: 8, textShadowOffset: { width: 0, height: 0 } } : {}}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                size={focused ? 36 : 28}
                name="home-outline"
                color={color}
                style={focused ? { textShadowColor: AppColors.accent, textShadowRadius: 10, textShadowOffset: { width: 0, height: 0 } } : {}}
              />
            ),
            tabBarLabelStyle: styles.centerLabel,
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            title: 'Account',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                size={focused ? 32 : 24}
                name="person-circle-outline"
                color={color}
                style={focused ? { textShadowColor: AppColors.accent, textShadowRadius: 12, textShadowOffset: { width: 0, height: 0 } } : {}}
              />
            ),
          }}
        />
      </Tabs>
    </TabsAuthGuard>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 16,
    left: 24,
    right: 24,
    elevation: 0,
    backgroundColor: 'transparent',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    height: 70,
    zIndex: 10,
  },
  tabBarBackground: {
    backgroundColor: 'rgba(17, 20, 23, 0.6)',
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

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { clearToken } from '../lib/auth';
import { useRouter } from 'expo-router';

interface NavbarProps {
  onLogout?: () => void;
  onMenuPress?: () => void;
}

export default function Navbar({ onLogout, onMenuPress }: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await clearToken();
    if (onLogout) {
      onLogout();
    }
    router.replace('/(auth)/login' as any);
  };

  return (
    <View style={styles.navbar}>
      <Text style={styles.title}>Flow</Text>
      <TouchableOpacity onPress={onMenuPress ?? handleLogout} activeOpacity={0.7}>
        <Text style={styles.logout}>{onMenuPress ? 'Menu' : 'Logout'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    height: 56,
    backgroundColor: '#0B0D0F',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1E24',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4AF37',
  },
  logout: {
    fontSize: 14,
    color: '#B8B2A7',
  },
});

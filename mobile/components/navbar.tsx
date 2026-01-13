import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface NavbarProps {
  onMenuPress: () => void;
}

export default function Navbar({ onMenuPress }: NavbarProps) {
  return (
    <View style={styles.navbar}>
      <Text style={styles.logo}>Flow</Text>
      <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
        <View style={styles.menuLine} />
        <View style={styles.menuLine} />
        <View style={styles.menuLine} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#0B0D0F',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1d21',
  },
  logo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#D4AF37',
  },
  menuButton: {
    padding: 8,
    gap: 4,
  },
  menuLine: {
    width: 24,
    height: 2,
    backgroundColor: '#EDE7DB',
    borderRadius: 1,
  },
});

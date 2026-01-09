import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface RightDrawerProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
  onUploadPress: () => void;
  hasBankData?: boolean;
}

export default function RightDrawer({ visible, onClose, onLogout, onUploadPress, hasBankData }: RightDrawerProps) {
  const width = Dimensions.get('window').width;
  const translateX = useRef(new Animated.Value(width)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateX, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(overlayOpacity, { toValue: 0.5, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, { toValue: width, duration: 200, useNativeDriver: true }),
        Animated.timing(overlayOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, translateX, overlayOpacity, width]);

  return (
    <View pointerEvents={visible ? 'auto' : 'none'} style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>
      <Animated.View style={[styles.drawer, { transform: [{ translateX }] }] }>
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          <Text style={styles.title}>Options</Text>
          {!hasBankData && (
            <TouchableOpacity style={styles.action} onPress={onUploadPress} activeOpacity={0.8}>
              <Text style={styles.actionText}>Upload Bank Statement</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.action, styles.logout]} onPress={onLogout} activeOpacity={0.8}>
            <Text style={[styles.actionText, styles.logoutText]}>Logout</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  drawer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '70%',
    backgroundColor: '#0B0D0F',
    borderLeftWidth: 1,
    borderLeftColor: '#1A1E24',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 16,
    color: '#D4AF37',
    fontWeight: '600',
    marginBottom: 16,
  },
  action: {
    paddingVertical: 14,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2A2E35',
    marginBottom: 12,
    alignItems: 'center',
    backgroundColor: '#111417',
  },
  actionText: {
    color: '#EDE7DB',
    fontSize: 15,
    fontWeight: '500',
  },
  logout: {
    backgroundColor: '#0B0D0F',
    borderColor: '#2A2E35',
  },
  logoutText: {
    color: '#B8B2A7',
  },
});
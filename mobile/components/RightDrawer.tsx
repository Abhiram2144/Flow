import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';

interface RightDrawerProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
  onUploadPress: () => void;
  hasBankData: boolean;
}

export default function RightDrawer({ visible, onClose, onLogout, onUploadPress, hasBankData }: RightDrawerProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.drawer} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Menu</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.menu}>
            <TouchableOpacity style={styles.menuItem} onPress={onUploadPress}>
              <Text style={styles.menuItemText}>
                {hasBankData ? 'Re-upload Bank Statement' : 'Upload Bank Statement'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={onLogout}>
              <Text style={[styles.menuItemText, styles.logoutText]}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  drawer: {
    backgroundColor: '#111417',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    minHeight: 300,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1d21',
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#EDE7DB',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 24,
    color: '#B8B2A7',
  },
  menu: {
    padding: 20,
  },
  menuItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1d21',
  },
  menuItemText: {
    fontSize: 16,
    color: '#EDE7DB',
  },
  logoutText: {
    color: '#ff6b6b',
  },
});

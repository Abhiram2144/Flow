import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { checkBankData, getBudgetCurrent, getMomentumCurrent, ApiError } from '../../lib/api';
import { Momentum } from '../../lib/types';
import Navbar from '../../components/navbar';
import RightDrawer from '../../components/RightDrawer';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BANK_UPLOAD_SHOWN_KEY = 'bank_upload_shown';

export default function HomeScreen() {
  const router = useRouter();
  const [momentum, setMomentum] = useState<Momentum | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [hasBankData, setHasBankData] = useState<boolean | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Check budget exists
      await getBudgetCurrent();

      // Check if we need to show bank upload (only once)
      const bankStatus = await checkBankData();
      setHasBankData(bankStatus.has_bank_data);
      const shown = await AsyncStorage.getItem(BANK_UPLOAD_SHOWN_KEY);
      if (!bankStatus.has_bank_data && !shown) {
        await AsyncStorage.setItem(BANK_UPLOAD_SHOWN_KEY, 'true');
        router.replace('/bank-upload');
        return;
      }

      // Load momentum data
      const m = await getMomentumCurrent();
      setMomentum(m);
    } catch (err) {
      const status = (err as ApiError).status;
      if (status === 401) {
        await AsyncStorage.removeItem(BANK_UPLOAD_SHOWN_KEY);
        router.replace('/(auth)/login' as any);
        return;
      }
      if (status === 404) {
        router.replace('/budget');
        return;
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const remaining = momentum?.momentum?.remaining ?? 0;
  const daysRemaining = momentum?.momentum?.days_remaining ?? 0;
  const confidence = momentum?.momentum?.confidence;
  const advice = momentum?.advice ?? '';

  const formattedRemaining = `£${remaining.toFixed(2)}`;
  const days = `${daysRemaining} days remaining`;

  return (
    <SafeAreaView style={styles.container}>
      <Navbar onMenuPress={() => setDrawerVisible(true)} />
      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.centerContent}>
            <Text style={styles.mainNumber}>{formattedRemaining}</Text>
            <Text style={styles.subtext}>{days}</Text>
            {confidence === 'low' && (
              <Text style={styles.helperText}>Based on past spending</Text>
            )}
          </View>

          <View style={styles.adviceBox}>
            <Text style={styles.advice}>{advice}</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={() => router.push('/add')} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Add Expense</Text>
          </TouchableOpacity>
        </View>
      )}
      <RightDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        onLogout={() => {
          setDrawerVisible(false);
          router.replace('/(auth)/login' as any);
        }}
        onUploadPress={() => {
          setDrawerVisible(false);
          router.push('/bank-upload');
        }}
        hasBankData={!!hasBankData}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0D0F' },
  content: { flex: 1, padding: 24, justifyContent: 'space-between' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mainNumber: { fontSize: 72, fontWeight: '700', color: '#EDE7DB', marginBottom: 8 },
  subtext: { fontSize: 16, color: '#B8B2A7', marginBottom: 16 },
  helperText: { fontSize: 12, color: '#8C8577', marginTop: 4 },
  adviceBox: { backgroundColor: '#111417', padding: 20, borderRadius: 6, marginBottom: 40 },
  advice: { fontSize: 15, color: '#EDE7DB', lineHeight: 22 },
  button: { backgroundColor: '#D4AF37', padding: 16, borderRadius: 6, alignItems: 'center' },
  buttonText: { color: '#0B0D0F', fontSize: 16, fontWeight: '600' },
});
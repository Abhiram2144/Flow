import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { getAdviceCurrent, getBudgetCurrent, getMomentumCurrent, ApiError } from '../../lib/api';
import { clearToken } from '../../lib/auth';
import { Momentum } from '../../lib/types';

export default function HomeScreen() {
  const router = useRouter();
  const [momentum, setMomentum] = useState<Momentum | null>(null);
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      await getBudgetCurrent();
      const [m, a] = await Promise.all([getMomentumCurrent(), getAdviceCurrent()]);
      setMomentum(m);
      setAdvice(a.text);
    } catch (err) {
      const status = (err as ApiError).status;
      if (status === 401) {
        router.replace('/(auth)/login' as any);
        return;
      }
      if (status === 404) {
        router.replace('/(main)/budget' as any);
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

  const formattedRemaining =
    momentum?.remaining != null ? `£${momentum.remaining.toFixed(2)}` : '—';
  const days = momentum?.daysRemaining != null ? `${momentum.daysRemaining} days remaining` : '';

  const handleLogout = async () => {
    await clearToken();
    router.replace('/(auth)/login' as any);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#000" />
        </View>
      ) : (
        <>
          <View style={styles.centerContent}>
            <Text style={styles.mainNumber}>{formattedRemaining}</Text>
            <Text style={styles.subtext}>{days}</Text>
          </View>

          <View style={styles.adviceBox}>
            <Text style={styles.advice}>{advice}</Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={() => router.push('/(main)/add' as any)}>
            <Text style={styles.buttonText}>Add Expense</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'space-between' },
  logoutButton: { alignSelf: 'flex-end' },
  logoutText: { fontSize: 13, color: '#999' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mainNumber: { fontSize: 72, fontWeight: '700', color: '#000', marginBottom: 8 },
  subtext: { fontSize: 16, color: '#666', marginBottom: 48 },
  adviceBox: { backgroundColor: '#f9f9f9', padding: 20, borderRadius: 6, marginBottom: 40 },
  advice: { fontSize: 15, color: '#333', lineHeight: 22 },
  button: { backgroundColor: '#000', padding: 16, borderRadius: 6, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
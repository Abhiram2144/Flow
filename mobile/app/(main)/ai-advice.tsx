import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ApiError, getBudgetCurrent, getAdviceCurrent, getAdviceWithHistory } from '@/lib/supabase-api';
import { clearToken, getToken } from '@/lib/auth';

export default function AIAdviceScreen() {
  const router = useRouter();
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [advice, setAdvice] = useState('');
  const [historicalData, setHistoricalData] = useState<any>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setState('loading');
    setError('');
    try {
      const token = await getToken();
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }

      try {
        await getBudgetCurrent();
      } catch (err) {
        const apiErr = err as ApiError;
        if (apiErr.status === 404) {
          router.replace('/onboarding');
          return;
        }
        if (apiErr.status === 401) {
          await clearToken();
          router.replace('/(auth)/login');
          return;
        }
        throw apiErr;
      }

      // Try to fetch advice with historical data
      try {
        const data = await getAdviceWithHistory();
        setAdvice(data.current_advice.text);
        setHistoricalData({
          previousSpending: data.previous_month_spending,
          currentBudget: data.current_month_budget,
          previousBudget: data.previous_month_budget,
        });
      } catch {
        // Fall back to current advice only
        const adviceData = await getAdviceCurrent();
        setAdvice(adviceData.text);
        setHistoricalData(null);
      }
      
      setState('ready');
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.status === 401) {
        await clearToken();
        router.replace('/(auth)/login');
        return;
      }
      setError(apiErr.message || 'Unable to load advice.');
      setState('error');
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  if (state === 'loading') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#D4AF37" />
        </View>
      </SafeAreaView>
    );
  }

  if (state === 'error') {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 32 }}>
          <Text style={styles.title}>Flow</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.primary} onPress={() => router.back()}>
            <Text style={styles.primaryText}>Back</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={styles.title}>Flow</Text>
        <Text style={styles.subtitle}>What you should know</Text>

        {historicalData && (
          <View style={styles.historyCard}>
            <Text style={styles.historyTitle}>Based on your history</Text>
            <View style={styles.historyRow}>
              <Text style={styles.historyLabel}>Last month spent:</Text>
              <Text style={styles.historyValue}>£{historicalData.previousSpending.toFixed(2)}</Text>
            </View>
            <View style={styles.historyRow}>
              <Text style={styles.historyLabel}>Last month budget:</Text>
              <Text style={styles.historyValue}>£{historicalData.previousBudget.toFixed(2)}</Text>
            </View>
            <View style={styles.historyRow}>
              <Text style={styles.historyLabel}>This month budget:</Text>
              <Text style={styles.historyValue}>£{historicalData.currentBudget.toFixed(2)}</Text>
            </View>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.adviceText}>{advice}</Text>
          <Text style={styles.note}>That's everything. Adjust gently.</Text>
        </View>

        <TouchableOpacity style={styles.primary} onPress={() => router.back()}>
          <Text style={styles.primaryText}>Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0D0F' },
  scroll: { flex: 1, padding: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#EDE7DB', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#B8B2A7', marginBottom: 20 },
  historyCard: { backgroundColor: '#111417', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#1A1E24', marginBottom: 16 },
  historyTitle: { fontSize: 14, fontWeight: '600', color: '#D4AF37', marginBottom: 12 },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  historyLabel: { fontSize: 13, color: '#B8B2A7' },
  historyValue: { fontSize: 13, color: '#EDE7DB', fontWeight: '600' },
  card: { backgroundColor: '#111417', padding: 16, borderRadius: 8, borderWidth: 1, borderColor: '#1A1E24', marginBottom: 16 },
  adviceText: { fontSize: 16, color: '#EDE7DB', lineHeight: 24, marginBottom: 8 },
  note: { fontSize: 13, color: '#8C8577', fontStyle: 'italic' },
  errorText: { color: '#E85D5D', fontSize: 14, marginBottom: 24 },
  primary: { backgroundColor: '#D4AF37', padding: 16, borderRadius: 8, alignItems: 'center' },
  primaryText: { color: '#0B0D0F', fontWeight: '700', fontSize: 16 },
});

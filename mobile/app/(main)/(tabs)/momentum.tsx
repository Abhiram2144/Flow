import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ApiError, getBudgetCurrent, getMomentumCurrent, getTransactions, Transaction } from '@/lib/supabase-api';
import { clearToken, getToken } from '@/lib/auth';
import { Momentum } from '@/lib/types';
import MomentumChart from '@/components/MomentumChart';

export default function MomentumScreen() {
  const router = useRouter();
  const [state, setState] = useState<'loading' | 'ready' | 'error' | 'unauthorized'>('loading');
  const [momentum, setMomentum] = useState<Momentum | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setState('loading');
    setError('');
    try {
      const token = await getToken();
      if (!token) {
        // Let root layout handle routing when no token
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
          // Let root layout handle routing after token clear
          return;
        }
        throw apiErr;
      }

      const data = await getMomentumCurrent();
      setMomentum(data);

      const txs = await getTransactions();
      setTransactions(txs);

      setState('ready');
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.status === 401) {
        await clearToken();
        // Let root layout handle routing after token clear
        return;
      }
      setError(apiErr.message || 'Unable to load momentum.');
      setState('error');
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  // Refetch when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const statusText = useMemo(() => {
    if (!momentum) return '';
    const recent = momentum.momentum.recent_daily;
    const expected = momentum.momentum.expected_daily;
    const delta = recent - expected;
    if (Math.abs(delta) < 0.5) return "You're on pace.";
    const status = delta > 0 ? 'above' : 'below';
    return `You're £${Math.abs(delta).toFixed(2)} ${status} pace.`;
  }, [momentum]);

  // Calculate days remaining from today to end of month
  const daysRemaining = useMemo(() => {
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const diff = lastDay.getDate() - today.getDate();
    return Math.max(0, diff);
  }, []);

  if (state === 'loading') {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#D4AF37" style={{ marginTop: 32 }} />
      </SafeAreaView>
    );
  }

  if (state === 'error') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorBox}>
          <Text style={styles.title}>Unable to load momentum</Text>
          <Text style={styles.subtitle}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={styles.title}>Status:</Text>
        <Text style={styles.statusText}>{statusText}</Text>

        <Text style={styles.sectionTitle}>Momentum progress:</Text>
        <MomentumChart 
          transactions={transactions.map(tx => ({ date: tx.date, amount: tx.amount }))} 
          budget={momentum?.momentum?.budget_amount || 0}
        />

        <Text style={styles.sectionTitle}>History:</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colDate]}>Date</Text>
            <Text style={[styles.tableHeaderText, styles.colMerchant]}>Merchant</Text>
            <Text style={[styles.tableHeaderText, styles.colAmount]}>Amount</Text>
          </View>
          {transactions.length === 0 ? (
            <View style={styles.emptyRow}>
              <Text style={styles.emptyText}>No transactions yet</Text>
            </View>
          ) : (
            transactions.map((tx) => (
              <View key={tx.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.colDate]}>
                  {new Date(tx.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                </Text>
                <Text style={[styles.tableCell, styles.colMerchant]} numberOfLines={1}>
                  {tx.merchant}
                </Text>
                <Text style={[styles.tableCell, styles.colAmount]}>£{tx.amount.toFixed(2)}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0D0F' },
  scroll: { flex: 1, padding: 24 },
  title: { fontSize: 14, color: '#EDE7DB', marginBottom: 8 },
  statusText: { fontSize: 18, fontWeight: '600', color: '#EDE7DB', marginBottom: 24 },
  sectionTitle: { fontSize: 14, color: '#EDE7DB', marginTop: 16, marginBottom: 12 },
  chartPlaceholder: { backgroundColor: '#111417', height: 150, borderRadius: 8, borderWidth: 1, borderColor: '#1A1E24', marginBottom: 24, alignItems: 'center', justifyContent: 'center' },
  chartText: { fontSize: 48, opacity: 0.3 },
  table: { backgroundColor: '#111417', borderRadius: 8, borderWidth: 1, borderColor: '#1A1E24', overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#1A1E24', padding: 12, borderBottomWidth: 1, borderBottomColor: '#2A2E35' },
  tableHeaderText: { fontSize: 12, fontWeight: '600', color: '#B8B2A7', textTransform: 'uppercase' },
  tableRow: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#1A1E24' },
  tableCell: { fontSize: 14, color: '#EDE7DB' },
  colDate: { width: '25%' },
  colMerchant: { width: '50%' },
  colAmount: { width: '25%', textAlign: 'right' },
  emptyRow: { padding: 32, alignItems: 'center' },
  emptyText: { color: '#8C8577', fontSize: 14 },
  errorBox: { flex: 1, justifyContent: 'center', padding: 24 },
  subtitle: { fontSize: 14, color: '#B8B2A7', marginTop: 8, textAlign: 'center' },
  primary: { backgroundColor: '#D4AF37', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 16 },
  primaryText: { color: '#0B0D0F', fontWeight: '700', fontSize: 16 },
});

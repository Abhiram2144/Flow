import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ApiError, checkBankData, getBudgetCurrent, getMomentumCurrent } from '@/lib/supabase-api';
import { clearToken, getToken } from '@/lib/auth';
import { Momentum as MomentumType } from '@/lib/types';

const edgeCopy = 'To calculate momentum, upload a bank statement or add expenses for at least a week.';

export default function HomeScreen() {
  const router = useRouter();
  const [state, setState] = useState<'loading' | 'ready' | 'error' | 'unauthorized'>('loading');
  const [momentum, setMomentum] = useState<MomentumType | null>(null);
  const [budget, setBudget] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [hasBankData, setHasBankData] = useState<boolean | null>(null);

  const load = useCallback(async () => {
    setState('loading');
    setError('');
    try {
      const token = await getToken();
      if (!token) {
        // Let root layout handle routing when no token
        return;
      }

      // Fetch current budget
      let budgetAmount = 0;
      try {
        const budgetData = await getBudgetCurrent();
        budgetAmount = budgetData.total_budget;
        setBudget(budgetAmount);
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

      const bankStatus = await checkBankData();
      setHasBankData(bankStatus.has_bank_data);

      const m = await getMomentumCurrent();
      setMomentum(m);
      setState('ready');
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.status === 401) {
        await clearToken();
        setState('unauthorized');
        return;
      }
      setError(apiErr.message || 'Failed to load data.');
      setState('error');
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  // Refetch data when screen comes into focus (e.g., after adding transaction or changing budget)
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const daysInMonth = momentum?.momentum?.days_in_month ?? 0;
  const daysRemaining = (() => {
    // Calculate days remaining from today to end of month
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const diff = lastDay.getDate() - today.getDate();
    return Math.max(0, diff);
  })();
  const daysSpent = daysInMonth - daysRemaining;
  const showEdge = !hasBankData && daysSpent < 7;
  const advice = showEdge ? edgeCopy : momentum?.advice ?? 'Stay on track today.';
  const budgetAmount = budget ?? momentum?.momentum?.budget_amount ?? 0;
  const totalSpent = momentum?.momentum?.total_spent ?? 0;
  const remaining = momentum?.momentum?.remaining ?? 0;
  const avgDaily = momentum?.momentum?.recent_daily ?? 0;
  const progress = budgetAmount > 0 ? Math.min(totalSpent / budgetAmount, 1) : 0;

  // LOADING
  if (state === 'loading') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loadingText}>Loading your budget...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (state === 'error') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorBox}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.subtitle}>{error}</Text>
          <TouchableOpacity style={styles.primary} onPress={load}>
            <Text style={styles.primaryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={styles.monthTitle}>This January:</Text>
        
        <View style={styles.mainCard}>
          <View style={styles.budgetRow}>
            <View style={styles.budgetTextBox}>
              <Text style={styles.budgetAmount}>£{remaining.toFixed(0)}</Text>
              <Text style={styles.budgetSubtext}>out of £{budgetAmount.toFixed(0)}</Text>
            </View>
            <View style={styles.progressCircle}>
              <View style={[styles.progressFill, { height: `${progress * 100}%` }]} />
            </View>
          </View>
        </View>

        <Text style={styles.avgSpending}>Average Spending: £{avgDaily.toFixed(0)}/day</Text>

        <View style={styles.adviceCard}>
          <Text style={styles.adviceTitle}>Flow's Advice:</Text>
          <Text style={styles.adviceText}>{advice}</Text>
          {!showEdge && (
            <TouchableOpacity onPress={() => router.push('/(main)/ai-advice')}>
              <Text style={styles.aiInsights}>AI insights</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/add')}>
          <Text style={styles.addButtonText}>Add Expense</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0D0F' },
  scroll: { flex: 1, padding: 24 },
  loaderBox: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#B8B2A7', marginTop: 12 },
  title: { fontSize: 20, color: '#EDE7DB', fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#B8B2A7', marginBottom: 8 },
  monthTitle: { fontSize: 14, color: '#EDE7DB', marginBottom: 12 },
  mainCard: { backgroundColor: '#E5E5E5', borderRadius: 8, padding: 20, marginBottom: 16 },
  budgetRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  budgetTextBox: { flex: 1 },
  budgetAmount: { fontSize: 48, fontWeight: '700', color: '#000000', lineHeight: 56 },
  budgetSubtext: { fontSize: 14, color: '#555555', marginTop: 4 },
  progressCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#000000', overflow: 'hidden', justifyContent: 'flex-end', marginLeft: 16 },
  progressFill: { width: '100%', backgroundColor: '#D4AF37' },
  daysRemaining: { fontSize: 14, color: '#000000', textAlign: 'right' },
  avgSpending: { fontSize: 14, color: '#EDE7DB', marginBottom: 16 },
  adviceCard: { backgroundColor: '#E5E5E5', borderRadius: 8, padding: 16, marginBottom: 16 },
  adviceTitle: { fontSize: 14, fontWeight: '600', color: '#000000', marginBottom: 8 },
  adviceText: { fontSize: 14, color: '#000000', marginBottom: 8 },
  aiInsights: { fontSize: 12, color: '#4A90E2', textAlign: 'right' },
  addButton: { backgroundColor: '#FFD966', borderRadius: 8, padding: 16, alignItems: 'center' },
  addButtonText: { fontSize: 16, fontWeight: '600', color: '#000000' },
  primary: { backgroundColor: '#D4AF37', padding: 16, borderRadius: 8, alignItems: 'center' },
  primaryText: { color: '#0B0D0F', fontWeight: '700', fontSize: 16 },
  errorBox: { flex: 1, justifyContent: 'center', padding: 24 },
});

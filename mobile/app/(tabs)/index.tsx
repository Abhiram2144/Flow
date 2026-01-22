import { ActivityIndicator, Pressable, ScrollView, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useEffect } from 'react';
import { format } from 'date-fns';
import { Link, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';

import { AppColors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useMonthlyExpenses } from '@/hooks/use-expenses';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Badge,
  Stat,
  Alert,
  Progress,
} from '@/components/ui';
import { 
  getMomentum, 
  getRemainingBudget, 
  getAverageDailySpend,
  getProjectedMonthEndSpend,
  type Expense 
} from '@/utils';


export default function DashboardScreen() {
  const { user, profile, session } = useAuth();
  const router = useRouter();
  // Always call hooks at the top level
  const { data: expenses, totals, isLoading, error } = useMonthlyExpenses(user?.id ?? null);

  useEffect(() => {
    if (profile && !profile.monthly_budget) {
      router.replace('/(auth)/onboarding');
    }
  }, [profile, router]);

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.fullScreenLoader}>
          <ActivityIndicator size="large" color={AppColors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  const budget = profile?.monthly_budget ?? 0;
  const spent = totals.total;
  
  // Use utility functions for calculations
  const expenseData: Expense[] = expenses?.map(exp => ({
    amount: exp.amount,
    date: exp.date,
    category: exp.category,
    merchant: exp.merchant || undefined,
  })) || [];
  
  const momentum = getMomentum(budget, expenseData);
  const remaining = getRemainingBudget(budget, spent);
  const projection = getProjectedMonthEndSpend(expenseData, budget);
  const averageDaily = getAverageDailySpend(expenseData, new Date().getDate());
  const percentage = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;

  const statusLabel =
    momentum.status === 'SAFE'
      ? 'On Pace'
      : momentum.status === 'BALANCED'
        ? 'Balanced'
        : 'At Risk';

  const statusTrend =
    momentum.status === 'RISK'
      ? 'down'
      : momentum.status === 'SAFE'
        ? 'up'
        : 'neutral';

  const statusBadgeVariant =
    momentum.status === 'SAFE'
      ? 'success'
      : momentum.status === 'BALANCED'
        ? 'warning'
        : 'error';

  const now = new Date();
  const monthName = format(now, 'MMMM');

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.fullScreenLoader}>
          <ActivityIndicator size="large" color={AppColors.accent} />
          <Text style={styles.loadingText}>Loading your budget...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Alert
            variant="error"
            title="Unable to load budget"
            message={error.message || 'Please try again'}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.monthTitle}>{monthName} Budget</Text>
            <Text style={styles.monthSubtitle}>
              {format(now, 'EEEE, d MMMM yyyy')}
            </Text>
          </View>
        </View>

        {/* Main Budget Card */}
        <Card variant="elevated" style={styles.mainCard}>
          <CardContent>
            <View style={styles.budgetContent}>
              <View style={styles.leftColumn}>
                <Text style={styles.remainingLabel}>Remaining</Text>
                <Text style={styles.remainingAmount}>
                  £{Math.max(remaining, 0).toFixed(0)}
                </Text>
                <Text style={styles.budgetSubtext}>out of £{budget.toFixed(0)}</Text>
              </View>
              <View style={styles.progressSection}>
                <CircularProgressIndicator percentage={percentage} size={100} />
              </View>
            </View>
            <Progress
              value={spent}
              max={budget}
              variant={
                percentage < 70
                  ? 'success'
                  : percentage < 90
                    ? 'warning'
                    : 'error'
              }
              style={styles.mt16}
            />
          </CardContent>
        </Card>

        {/* Status & Momentum */}
        <View style={styles.statusRow}>
          <Card style={styles.statusCard}>
            <CardContent style={styles.smallCardContent}>
              <Stat
                label="Status"
                value={statusLabel}
                format="text"
                trend={statusTrend}
              />
            </CardContent>
          </Card>
          <Card style={styles.statusCard}>
            <CardContent style={styles.smallCardContent}>
              <Stat
                label="Daily Average"
                value={averageDaily}
                format="currency"
              />
            </CardContent>
          </Card>
        </View>

        {/* Insight Card */}
        <Card variant="outline" style={styles.insightCard}>
          <CardHeader>
            <View style={styles.insightHeader}>
              <Text style={styles.insightTitle}>💡 Flow Insight</Text>
              <Badge variant={statusBadgeVariant}>{statusLabel}</Badge>
            </View>
          </CardHeader>
          <CardContent>
            <Text style={styles.insightText}>{momentum.message}</Text>
            <Text style={styles.projectionText}>
              {projection.message}
            </Text>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Text style={styles.sectionTitle}>Quick Stats</Text>
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <CardContent style={styles.smallCardContent}>
              <Stat
                label="Spent"
                value={spent}
                format="currency"
              />
            </CardContent>
          </Card>
          <Card style={styles.statCard}>
            <CardContent style={styles.smallCardContent}>
              <Stat
                label="Spent %"
                value={percentage}
                format="number"
              />
            </CardContent>
          </Card>
        </View>
      </ScrollView>

      {/* Add Expense Button */}
      <Link href="/add" asChild>
        <Pressable
          style={styles.addButton}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Text style={styles.addButtonText}>+ Add Expense</Text>
        </Pressable>
      </Link>
    </SafeAreaView>
  );
}

function CircularProgressIndicator({ percentage, size = 60 }: { percentage: number; size?: number }) {
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const fillHeight = (size * percentage) / 100;

  return (
    <Svg width={size} height={size}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#D4D4D4"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={AppColors.accent}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={circumference - (circumference * percentage) / 100}
        rotation={-90}
        originX={size / 2}
        originY={size / 2}
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  monthTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  monthSubtitle: {
    fontSize: 13,
    color: AppColors.textSecondary,
  },
  mainCard: {
    marginBottom: 16,
  },
  budgetContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  leftColumn: {
    flex: 1,
  },
  remainingLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  remainingAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: AppColors.accent,
    marginBottom: 4,
  },
  budgetSubtext: {
    fontSize: 13,
    color: AppColors.textSecondary,
  },
  progressSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mt16: {
    marginTop: 16,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statusCard: {
    flex: 1,
  },
  smallCardContent: {
    padding: 12,
  },
  insightCard: {
    marginBottom: 16,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  insightText: {
    fontSize: 14,
    color: AppColors.textPrimary,
    lineHeight: 20,
    marginBottom: 8,
  },
  projectionText: {
    fontSize: 12,
    color: AppColors.textSecondary,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
  },
  addButton: {
    position: 'absolute',
    bottom: 80,
    left: 16,
    right: 16,
    backgroundColor: AppColors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: AppColors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B0D0F',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.background,
    gap: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: AppColors.textSecondary,
  },
});

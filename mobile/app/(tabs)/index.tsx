import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { format } from 'date-fns';
import { Link, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { Rect, Path, G, Ellipse } from 'react-native-svg';
import { Animated, Easing } from 'react-native';

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
  const insets = useSafeAreaInsets();
  // Always call hooks at the top level
  const { data: expenses, totals, isLoading, error } = useMonthlyExpenses(user?.id ?? null);

  useEffect(() => {
    if (profile && !profile.monthly_budget) {
      router.replace('/(auth)/onboarding');
    }
  }, [profile, router]);

  if (!session) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}> 
        <View style={styles.fullScreenLoader}>
          <ActivityIndicator size="large" color={AppColors.primary} />
        </View>
      </View>
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
  // Find first expense date in this month
  let daysPassed = 1;
  if (expenseData.length > 0) {
    const firstExpense = expenseData.reduce((min, exp) =>
      new Date(exp.date) < new Date(min.date) ? exp : min, expenseData[0]);
    const firstDate = new Date(firstExpense.date);
    const now = new Date();
    daysPassed = Math.max(1, Math.floor((now.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  }
  const averageDaily = getAverageDailySpend(expenseData, daysPassed);
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
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}> 
        <View style={styles.fullScreenLoader}>
          <ActivityIndicator size="large" color={AppColors.primary} />
          <Text style={styles.loadingText}>Loading your budget...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}> 
        <ScrollView contentContainerStyle={styles.content}>
          <Alert
            variant="error"
            title="Unable to load budget"
            message={error.message || 'Please try again'}
          />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}> 
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
                <FishTankProgressIndicator percentage={percentage} size={100} />
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
    </View>
  );
}


function FishTankProgressIndicator({ percentage, size = 100 }: { percentage: number; size?: number }) {
  // Animated water level
  const AnimatedRect = Animated.createAnimatedComponent(Rect);
  const waterLevel = new Animated.Value(0);
  Animated.timing(waterLevel, {
    toValue: percentage,
    duration: 900,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: false,
  }).start();

  // Tank dimensions
  const tankWidth = size;
  const tankHeight = size * 1.1;
  const tankRadius = 18;
  const waterMax = tankHeight - 16;
  const waterMin = 16;
  const waterY = waterMax - ((waterMax - waterMin) * percentage) / 100;

  // Fish position (moves horizontally with percentage)
  const fishX = 20 + ((tankWidth - 40) * percentage) / 100;
  const fishY = waterY + 18;

  // Simple wave path for water surface
  const waveWidth = tankWidth - 16;
  const waveHeight = 8;
  const waveY = waterY;
  const wavePath = `M8,${waveY} Q${tankWidth / 4},${waveY + waveHeight} ${tankWidth / 2},${waveY} Q${tankWidth * 3 / 4},${waveY - waveHeight} ${tankWidth - 8},${waveY}`;

  return (
    <Svg width={tankWidth} height={tankHeight}>
      {/* Tank outline */}
      <Rect
        x={4}
        y={8}
        width={tankWidth - 8}
        height={tankHeight - 16}
        rx={tankRadius}
        fill={AppColors.card}
        stroke={AppColors.primary}
        strokeWidth={3}
      />
      {/* Water fill */}
      <Rect
        x={8}
        y={waterY}
        width={tankWidth - 16}
        height={tankHeight - 16 - waterY}
        rx={tankRadius - 6}
        fill={AppColors.primary}
        fillOpacity={0.2}
      />
      {/* Water surface wave */}
      <Path
        d={wavePath}
        stroke={AppColors.primary}
        strokeWidth={2}
        fill="none"
      />
      {/* Fish (simple ellipse + tail) */}
      <G x={fishX} y={fishY}>
        <Ellipse cx={0} cy={0} rx={12} ry={7} fill={AppColors.secondary} />
        <Path d="M-12,0 Q-18,-4 -16,0 Q-18,4 -12,0" fill={AppColors.secondary} />
        <Ellipse cx={5} cy={-2} rx={2} ry={2} fill={AppColors.card} />
        <Ellipse cx={6} cy={-2} rx={0.7} ry={0.7} fill={AppColors.primaryForeground} />
      </G>
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
    color: AppColors.primary,
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
    bottom: 100, // move above tab bar
    left: 32,
    right: 32,
    backgroundColor: AppColors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 12,
    shadowColor: AppColors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    zIndex: 100,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: AppColors.primaryForeground,
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

import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { format } from 'date-fns';
import { useMonthlyExpenses } from '@/hooks/use-expenses';
import { useAuth } from '@/context/AuthContext';
import { AppColors } from '@/constants/theme';
import { MomentumChart } from '@/components/MomentumChart';
import {
  Card,
  CardContent,
  CardHeader,
  Badge,
  Stat,
  Alert,
} from '@/components/ui';
import {
  getMomentum,
  getDaysInMonth,
  getMonthStart,
  type Expense
} from '@/utils';


export default function MomentumScreen() {
  const insets = useSafeAreaInsets();
  const { profile, user, session } = useAuth();

  const { data: expenses, totals, isLoading, error } = useMonthlyExpenses(user?.id ?? null);

  const totalSpent = totals?.total || 0;
  const budget = profile?.monthly_budget || 0;

  const now = new Date();
  const start = getMonthStart(now);
  const daysInMonth = getDaysInMonth(now);
  // Find first expense date in this month
  let daysPassed = 1;
  if (expenses && expenses.length > 0) {
    const firstExpense = expenses.reduce((min, exp) =>
      new Date(exp.date) < new Date(min.date) ? exp : min, expenses[0]);
    const firstDate = new Date(firstExpense.date);
    daysPassed = Math.max(1, Math.floor((now.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  }

  // Use utility function for momentum calculation
  const expenseData: Expense[] = expenses?.map(exp => ({
    amount: exp.amount,
    date: exp.date,
    category: exp.category,
    merchant: exp.merchant || undefined,
  })) || [];

  const momentum = getMomentum(budget, expenseData, now);

  const expectedDaily = budget / daysInMonth;
  const expectedSpent = expectedDaily * daysPassed;
  const difference = totalSpent - expectedSpent;

  const statusText = difference > 0
    ? `You're £${Math.abs(difference).toFixed(0)} above pace`
    : difference < -expectedSpent * 0.1
      ? `You're £${Math.abs(difference).toFixed(0)} below pace`
      : "You're on pace";

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}> 
        <View style={styles.fullScreenLoader}>
          <ActivityIndicator size="large" color={AppColors.primary} />
          <Text style={styles.loadingText}>Analyzing momentum...</Text>
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
            title="Unable to load momentum"
            message={error.message || 'Please try again'}
          />
        </ScrollView>
      </View>
    );
  }

  // Transform expenses for chart
  const transactions = expenses?.map(exp => ({
    date: exp.date,
    amount: exp.amount,
  })) || [];

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}> 
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>📈 Momentum</Text>
          <Text style={styles.subtitle}>{format(now, 'MMMM yyyy')}</Text>
        </View>

        {/* Status Card */}
        <Card variant="elevated">
          <CardContent>
            <View style={styles.statusContent}>
              <View>
                <Text style={styles.statusLabel}>Current Status</Text>
                <Text style={styles.statusValue}>{statusText}</Text>
              </View>
              <Badge
                variant={
                  difference > expectedDaily * 3 ? 'error' : difference > 0 ? 'warning' : 'success'
                }
              >
                {momentum.status}
              </Badge>
            </View>
          </CardContent>
        </Card>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <Card style={styles.metricCard}>
            <CardContent style={styles.smallCardContent}>
              <Stat
                label="Total Spent"
                value={totalSpent}
                format="currency"
              />
            </CardContent>
          </Card>
          <Card style={styles.metricCard}>
            <CardContent style={styles.smallCardContent}>
              <Stat
                label="Days Passed"
                value={daysPassed}
                format="number"
              />
            </CardContent>
          </Card>
        </View>

        <View style={styles.metricsGrid}>
          <Card style={styles.metricCard}>
            <CardContent style={styles.smallCardContent}>
              <Stat
                label="Expected Spent"
                value={expectedSpent}
                format="currency"
              />
            </CardContent>
          </Card>
          <Card style={styles.metricCard}>
            <CardContent style={styles.smallCardContent}>
              <Stat
                label="Difference"
                value={Math.abs(difference)}
                format="currency"
                trend={difference > 0 ? 'down' : 'up'}
              />
            </CardContent>
          </Card>
        </View>

        {/* Chart Card */}
        <Card variant="default">
          <CardHeader>
            <Text style={styles.chartTitle}>💹 Spending Momentum</Text>
          </CardHeader>
          <CardContent>
            <MomentumChart transactions={transactions} budgetStartDate={start} />
          </CardContent>
        </Card>

        {/* Recent Transactions Card */}
        <Card variant="default">
          <CardHeader>
            <Text style={styles.transactionTitle}>📝 Recent Transactions</Text>
          </CardHeader>
          <CardContent style={styles.transactionContent}>
            {expenses && expenses.length > 0 ? (
              <View style={styles.transactionListContainer}>
                <ScrollView
                  style={styles.transactionList}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                >
                  {expenses.map((expense, index) => (
                    <View
                      key={expense.id}
                      style={[
                        styles.transactionRow,
                        index !== expenses.length - 1 && styles.transactionBorder,
                      ]}
                    >
                      <View style={styles.transactionLeft}>
                        <Text style={styles.transactionMerchant}>
                          {expense.merchant || expense.category}
                        </Text>
                        <Text style={styles.transactionDate}>
                          {format(new Date(expense.date), 'MMM d')}
                        </Text>
                      </View>
                      <Text style={styles.transactionAmount}>
                        £{expense.amount.toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No transactions yet</Text>
    </View>
            )}
          </CardContent>
        </Card>
      </ScrollView>
    </View>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: AppColors.textSecondary,
  },
  statusContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
  },
  smallCardContent: {
    padding: 12,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  transactionContent: {
    padding: 0,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  transactionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  transactionLeft: {
    flex: 1,
  },
  transactionMerchant: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: AppColors.textSecondary,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: AppColors.primary,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: AppColors.textTertiary,
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
  transactionListContainer: {
    maxHeight: 400,
  },
  transactionList: {
    maxHeight: 400,
  },
});

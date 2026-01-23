import { Dimensions, Text, View, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { AppColors } from '@/constants/theme';

interface Transaction {
  date: string;
  amount: number;
}

interface MomentumChartProps {
  transactions: Transaction[];
  budgetStartDate: Date;
}

export function MomentumChart({ transactions, budgetStartDate }: MomentumChartProps) {
  if (!transactions || transactions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Add transactions to see momentum</Text>
      </View>
    );
  }

  // Group transactions by day (days since budget start)
  const dailyData = groupByDay(transactions, budgetStartDate);

  if (dailyData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Not enough data to display chart</Text>
      </View>
    );
  }

  // Prepare data for LineChart
  const labels = dailyData.map(d => d.day.toString());
  const data = dailyData.map(d => d.amount);

  // If only one data point, add a dummy 0 point at start so line renders
  if (data.length === 1) {
    labels.unshift('0');
    data.unshift(0);
  }

  const chartData = {
    labels,
    datasets: [
      {
        data,
        color: (opacity = 1) => AppColors.primary,
        strokeWidth: 3,
      },
    ],
  };

  return (
    <View style={styles.container}>
      <LineChart
        data={chartData}
        width={Dimensions.get('window').width - 48} // card width calculation
        height={220}
        yAxisLabel="£"
        chartConfig={{
          backgroundColor: AppColors.background,
          backgroundGradientFrom: AppColors.card,
          backgroundGradientTo: AppColors.card,
          decimalPlaces: 0,
          color: (opacity = 1) => AppColors.primary,
          labelColor: (opacity = 1) => AppColors.textSecondary,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: "4",
            strokeWidth: "2",
            stroke: AppColors.primary,
            fill: AppColors.card
          },
          propsForBackgroundLines: {
            strokeWidth: 1,
            stroke: AppColors.border,
            strokeDasharray: "4",
          }
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
        withInnerLines={true}
        withOuterLines={false}
        withVerticalLines={false}
      />
    </View>
  );
}

function groupByDay(transactions: Transaction[], budgetStartDate: Date): { day: number; amount: number }[] {
  const days: { [key: number]: number } = {};
  transactions.forEach(tx => {
    const txDate = new Date(tx.date);
    // Calculate days since budget start (1-based)
    const daysSinceStart = Math.floor((txDate.getTime() - budgetStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (daysSinceStart > 0) {
      days[daysSinceStart] = (days[daysSinceStart] || 0) + tx.amount;
    }
  });
  return Object.entries(days).map(([day, amount]) => ({
    day: parseInt(day),
    amount,
  })).sort((a, b) => a.day - b.day);
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: AppColors.textTertiary,
  },
});

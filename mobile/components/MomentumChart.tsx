import { Dimensions, Text, View, StyleSheet } from 'react-native';
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';
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

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 80;
  const chartHeight = 200;
  const padding = { top: 20, right: 40, bottom: 40, left: 50 };

  // Group transactions by day (days since budget start)
  const dailyData = groupByDay(transactions, budgetStartDate);
  
  // Calculate chart dimensions
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;
  
  const maxAmount = Math.max(...dailyData.map(d => d.amount), 0);
  const ySteps = 5;
  const yStepValue = Math.ceil(maxAmount / ySteps);
  
  // Generate points for the line
  const points = dailyData.map((day, index) => {
    const x = padding.left + (index / (dailyData.length - 1 || 1)) * plotWidth;
    const y = padding.top + plotHeight - (day.amount / (yStepValue * ySteps)) * plotHeight;
    return { x, y, amount: day.amount, day: day.day };
  });

  // Create smooth curve path
  const pathData = createSmoothPath(points);

  return (
    <View style={styles.container}>
      <Svg width={chartWidth} height={chartHeight}>
        {/* Grid lines */}
        {Array.from({ length: ySteps + 1 }).map((_, i) => {
          const y = padding.top + (i / ySteps) * plotHeight;
          return (
            <Line
              key={`grid-${i}`}
              x1={padding.left}
              y1={y}
              x2={chartWidth - padding.right}
              y2={y}
              stroke={AppColors.border}
              strokeWidth="1"
            />
          );
        })}

        {/* Y-axis labels */}
        {Array.from({ length: ySteps + 1 }).map((_, i) => {
          const value = yStepValue * (ySteps - i);
          const y = padding.top + (i / ySteps) * plotHeight;
          return (
            <SvgText
              key={`ylabel-${i}`}
              x={padding.left - 10}
              y={y + 4}
              fontSize="12"
              fill={AppColors.textTertiary}
              textAnchor="end"
              fontFamily="system-ui"
              fontWeight="400"
            >
              £{value}
            </SvgText>
          );
        })}

        {/* X-axis labels */}
        {dailyData.map((day, index) => {
          // Show every 5th day to avoid crowding
          if (index % 5 !== 0 && index !== dailyData.length - 1) return null;
          const x = padding.left + (index / (dailyData.length - 1 || 1)) * plotWidth;
          return (
            <SvgText
              key={`xlabel-${index}`}
              x={x}
              y={chartHeight - padding.bottom + 20}
              fontSize="11"
              fill={AppColors.textTertiary}
              textAnchor="middle"
              fontFamily="system-ui"
              fontWeight="400"
            >
              {day.day}
            </SvgText>
          );
        })}

        {/* Line path */}
        <Path
          d={pathData}
          fill="none"
          stroke={AppColors.accent}
          strokeWidth="3"
        />

        {/* Data points */}
        {points.map((point, index) => (
          <Circle
            key={`point-${index}`}
            cx={point.x}
            cy={point.y}
            r="4"
            fill={AppColors.accent}
          />
        ))}

        {/* Individual transaction dots (semi-transparent) */}
        {transactions.map((tx, index) => {
          const dayIndex = getDayIndex(tx.date, dailyData, budgetStartDate);
          if (dayIndex === -1) return null;
          const x = padding.left + (dayIndex / (dailyData.length - 1 || 1)) * plotWidth;
          const y = padding.top + plotHeight - (tx.amount / (yStepValue * ySteps)) * plotHeight;
          return (
            <Circle
              key={`tx-${index}`}
              cx={x}
              cy={y}
              r="2"
              fill={AppColors.accent}
              opacity="0.3"
            />
          );
        })}
      </Svg>
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

function getDayIndex(date: string, dailyData: { day: number; amount: number }[], budgetStartDate: Date): number {
  const txDate = new Date(date);
  const daysSinceStart = Math.floor((txDate.getTime() - budgetStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return dailyData.findIndex(data => data.day === daysSinceStart);
}

function createSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    
    // Calculate control points for cubic bezier
    const cp1x = current.x + (next.x - current.x) / 3;
    const cp1y = current.y;
    const cp2x = current.x + (2 * (next.x - current.x)) / 3;
    const cp2y = next.y;
    
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
  }

  return path;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
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

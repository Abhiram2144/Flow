import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line, Circle, Polyline, Text as SvgText, Path } from 'react-native-svg';

type WeeklyData = {
  week: number;
  weekLabel: string;
  spent: number;
};

type Props = {
  transactions: Array<{ date: string; amount: number }>;
  budget: number;
};

export default function MomentumChart({ transactions, budget }: Props) {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 80;
  const chartHeight = 200;
  const padding = { top: 20, right: 40, bottom: 40, left: 50 };

  const weeklyData = useMemo(() => {
    if (transactions.length === 0) return [];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Check if we have transactions from previous month
    const oldestTx = transactions.length > 0 
      ? new Date(transactions[transactions.length - 1].date)
      : today;
    
    // Start from beginning of oldest transaction's month or current month
    const startMonth = new Date(oldestTx.getFullYear(), oldestTx.getMonth(), 1);
    
    // Calculate weeks from start to today
    const weeks: WeeklyData[] = [];
    let currentWeekStart = new Date(startMonth);
    let weekNumber = 1;

    while (currentWeekStart <= today) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const effectiveEnd = weekEnd > today ? today : weekEnd;

      // Sum transactions for this week
      const weekSpent = transactions
        .filter((tx) => {
          const txDate = new Date(tx.date);
          return txDate >= currentWeekStart && txDate <= effectiveEnd;
        })
        .reduce((sum, tx) => sum + tx.amount, 0);

      weeks.push({
        week: weekNumber,
        weekLabel: `W${weekNumber}`,
        spent: weekSpent,
      });

      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      weekNumber++;
    }

    return weeks;
  }, [transactions]);

  const { maxY, yAxisSteps } = useMemo(() => {
    if (weeklyData.length === 0) return { maxY: 100, yAxisSteps: [0, 25, 50, 75, 100] };

    const maxSpent = Math.max(...weeklyData.map((w) => w.spent));
    const roundedMax = Math.ceil(maxSpent / 50) * 50 || 100;
    const steps = [0, roundedMax / 4, roundedMax / 2, (3 * roundedMax) / 4, roundedMax];
    return { maxY: roundedMax, yAxisSteps: steps };
  }, [weeklyData]);

  const chartData = useMemo(() => {
    if (weeklyData.length === 0) return { points: '', dots: [], pathData: '', transactionDots: [] };

    const innerWidth = chartWidth - padding.left - padding.right;
    const innerHeight = chartHeight - padding.top - padding.bottom;

    // Get time range for positioning
    const oldestTx = transactions.length > 0 ? new Date(transactions[transactions.length - 1].date) : new Date();
    const startTime = new Date(oldestTx.getFullYear(), oldestTx.getMonth(), 1).getTime();
    const endTime = new Date().getTime();
    const timeRange = endTime - startTime;

    const points = weeklyData
      .map((week, i) => {
        const x = padding.left + (i / Math.max(1, weeklyData.length - 1)) * innerWidth;
        const y = padding.top + innerHeight - (week.spent / maxY) * innerHeight;
        return `${x},${y}`;
      })
      .join(' ');

    const dots = weeklyData.map((week, i) => {
      const x = padding.left + (i / Math.max(1, weeklyData.length - 1)) * innerWidth;
      const y = padding.top + innerHeight - (week.spent / maxY) * innerHeight;
      return { x, y, week: week.weekLabel, spent: week.spent };
    });

    // Create curved path using cubic bezier curves
    let pathData = '';
    if (dots.length > 0) {
      pathData = `M ${dots[0].x},${dots[0].y}`;
      
      for (let i = 0; i < dots.length - 1; i++) {
        const current = dots[i];
        const next = dots[i + 1];
        const controlPointOffset = (next.x - current.x) * 0.5;
        
        // Cubic bezier curve
        pathData += ` C ${current.x + controlPointOffset},${current.y} ${next.x - controlPointOffset},${next.y} ${next.x},${next.y}`;
      }
    }

    // Calculate individual transaction positions
    const transactionDots = transactions.map(tx => {
      const txTime = new Date(tx.date).getTime();
      const timeOffset = txTime - startTime;
      const x = padding.left + (timeOffset / timeRange) * innerWidth;
      const y = padding.top + innerHeight - (tx.amount / maxY) * innerHeight;
      return { x, y, amount: tx.amount, date: tx.date };
    });

    return { points, dots, pathData, transactionDots };
  }, [weeklyData, maxY, chartWidth, chartHeight, padding, transactions]);

  if (transactions.length === 0) {
    return (
      <View style={[styles.container, { height: chartHeight }]}>
        <Text style={styles.emptyText}>Add transactions to see momentum</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Svg width={chartWidth} height={chartHeight}>
        {/* Y-axis labels */}
        {yAxisSteps.map((step, i) => {
          const y = padding.top + (chartHeight - padding.top - padding.bottom) * (1 - step / maxY);
          return (
            <SvgText
              key={i}
              x={padding.left - 8}
              y={y + 4}
              fontSize="9"
              fill="#B8B2A7"
              textAnchor="end"
            >
              {step === 0 ? '0' : `£${step}`}
            </SvgText>
          );
        })}

        {/* Grid lines */}
        {yAxisSteps.map((step, i) => {
          const y = padding.top + (chartHeight - padding.top - padding.bottom) * (1 - step / maxY);
          return (
            <Line
              key={i}
              x1={padding.left}
              y1={y}
              x2={chartWidth - padding.right}
              y2={y}
              stroke="#1A1E24"
              strokeWidth="1"
            />
          );
        })}

        {/* Line chart with smooth curves */}
        {chartData.pathData && (
          <Path
            d={chartData.pathData}
            fill="none"
            stroke="#D4AF37"
            strokeWidth="2"
          />
        )}

        {/* Weekly data points */}
        {chartData.dots.map((dot, i) => (
          <Circle key={i} cx={dot.x} cy={dot.y} r="4" fill="#D4AF37" />
        ))}

        {/* Individual transaction dots */}
        {chartData.transactionDots && chartData.transactionDots.map((dot, i) => (
          <Circle key={`tx-${i}`} cx={dot.x} cy={dot.y} r="3" fill="#EDE7DB" opacity="0.7" />
        ))}

        {/* X-axis labels */}
        {chartData.dots.map((dot, i) => (
          <SvgText
            key={i}
            x={dot.x}
            y={chartHeight - padding.bottom + 20}
            fontSize="10"
            fill="#B8B2A7"
            textAnchor="middle"
          >
            {dot.week}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111417',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1A1E24',
    padding: 16,
    marginBottom: 24,
  },
  emptyText: {
    color: '#8C8577',
    textAlign: 'center',
    fontSize: 14,
  },
});

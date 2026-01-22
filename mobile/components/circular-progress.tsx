import { StyleSheet, View } from 'react-native';
import { Circle, Svg } from 'react-native-svg';
import { ThemedText } from './themed-text';

interface CircularProgressProps {
  percentage: number;
  spent: number;
  budget: number;
  radius?: number;
}

export function CircularProgress({ percentage, spent, budget, radius = 60 }: CircularProgressProps) {
  const normalizedPercentage = Math.min(Math.max(percentage, 0), 100);
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedPercentage / 100) * circumference;

  return (
    <View style={styles.container}>
      <View style={styles.circle}>
        <Svg width={radius * 2 + 20} height={radius * 2 + 20} viewBox={`0 0 ${radius * 2 + 20} ${radius * 2 + 20}`}>
          {/* Background circle */}
          <Circle
            cx={radius + 10}
            cy={radius + 10}
            r={radius}
            fill="none"
            stroke="#2A2F3E"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <Circle
            cx={radius + 10}
            cy={radius + 10}
            r={radius}
            fill="none"
            stroke="#D4AF37"
            strokeWidth="8"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation={-90}
            originX={radius + 10}
            originY={radius + 10}
          />
        </Svg>

        {/* Center content */}
        <View style={styles.centerContent}>
          <ThemedText type="defaultSemiBold" style={styles.percentage}>
            {Math.round(normalizedPercentage)}%
          </ThemedText>
          <ThemedText type="default" style={styles.label}>
            Budget Used
          </ThemedText>
        </View>
      </View>

      {/* Details below circle */}
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <ThemedText type="default" style={styles.detailLabel}>
            Spent
          </ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.detailValue}>
            ${spent.toFixed(2)}
          </ThemedText>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailItem}>
          <ThemedText type="default" style={styles.detailLabel}>
            Budget
          </ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.detailValue}>
            ${budget.toFixed(2)}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 24,
  },
  circle: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  percentage: {
    fontSize: 28,
    color: '#D4AF37',
  },
  label: {
    fontSize: 12,
    color: '#A89968',
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#A89968',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#F5E6D3',
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: '#2A2F3E',
  },
});

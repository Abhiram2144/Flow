import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { AppColors } from '@/constants/theme';

export interface StatProps {
  label: string;
  value: string | number;
  format?: 'currency' | 'number' | 'text';
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  style?: ViewStyle;
}

export function Stat({
  label,
  value,
  format = 'text',
  icon,
  trend,
  trendValue,
  style,
}: StatProps) {
  const displayValue =
    format === 'currency'
      ? `£${Number(value).toFixed(2)}`
      : format === 'number'
        ? Number(value).toFixed(0)
        : value;

  const trendColor =
    trend === 'up'
      ? AppColors.primary
      : trend === 'down'
        ? AppColors.destructive
        : AppColors.textTertiary;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {icon && <View style={styles.icon}>{icon}</View>}
      </View>
      <View style={styles.valueWrapper}>
        <Text style={styles.value}>{displayValue}</Text>
        {trendValue && (
          <Text style={[styles.trend, { color: trendColor }]}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''} {trendValue}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.card,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 10,
    padding: 14,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: AppColors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  icon: {
    width: 24,
    height: 24,
  },
  valueWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.textPrimary,
  },
  trend: {
    fontSize: 12,
    fontWeight: '600',
  },
});

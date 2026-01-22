import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { AppColors } from '@/constants/theme';

export interface ProgressProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error';
  height?: number;
  style?: ViewStyle;
}

export function Progress({
  value,
  max = 100,
  showLabel = false,
  variant = 'default',
  height = 8,
  style,
}: ProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const barColor =
    variant === 'success'
      ? '#22c55e'
      : variant === 'warning'
        ? '#fb923c'
        : variant === 'error'
          ? AppColors.error
          : AppColors.accent;

  return (
    <View style={style}>
      <View
        style={[
          styles.container,
          {
            height,
            backgroundColor: AppColors.borderSubtle,
          },
        ]}>
        <View
          style={[
            styles.bar,
            {
              height,
              width: `${percentage}%`,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>
      {showLabel && (
        <Text style={styles.label}>{Math.round(percentage)}%</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.borderSubtle,
    borderRadius: 4,
    overflow: 'hidden',
    width: '100%',
  },
  bar: {
    borderRadius: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.textSecondary,
    marginTop: 6,
  },
});

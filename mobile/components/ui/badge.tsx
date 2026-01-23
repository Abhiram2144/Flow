import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { AppColors } from '@/constants/theme';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  style?: ViewStyle;
}

export function Badge({ children, variant = 'default', style }: BadgeProps) {
  return (
    <View style={[styles.badge, styles[`variant_${variant}`], style]}>
      <Text style={[styles.text, styles[`textVariant_${variant}`]]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Variants
  variant_default: {
    backgroundColor: AppColors.muted,
  },
  variant_success: {
    backgroundColor: AppColors.muted,
  },
  variant_warning: {
    backgroundColor: AppColors.muted,
  },
  variant_error: {
    backgroundColor: AppColors.muted,
  },
  variant_info: {
    backgroundColor: AppColors.muted,
  },

  textVariant_default: {
    color: AppColors.textPrimary,
  },
  textVariant_success: {
    color: AppColors.chart5,
  },
  textVariant_warning: {
    color: AppColors.chart3,
  },
  textVariant_error: {
    color: AppColors.destructive,
  },
  textVariant_info: {
    color: AppColors.chart2,
  },
});

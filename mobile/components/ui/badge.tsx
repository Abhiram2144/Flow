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
    backgroundColor: AppColors.borderSubtle,
  },
  variant_success: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  variant_warning: {
    backgroundColor: 'rgba(251, 146, 60, 0.2)',
  },
  variant_error: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
  },
  variant_info: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },

  textVariant_default: {
    color: AppColors.textPrimary,
  },
  textVariant_success: {
    color: '#22c55e',
  },
  textVariant_warning: {
    color: '#fb923c',
  },
  textVariant_error: {
    color: AppColors.error,
  },
  textVariant_info: {
    color: '#3b82f6',
  },
});

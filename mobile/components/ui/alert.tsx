import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { AppColors } from '@/constants/theme';

export interface AlertProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  title?: string;
  message: string;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function Alert({
  variant = 'default',
  title,
  message,
  icon,
  style,
}: AlertProps) {
  return (
    <View style={[styles.alert, styles[`variant_${variant}`], style]}>
      <View style={styles.content}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <View style={styles.text}>
          {title && <Text style={styles.title}>{title}</Text>}
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  alert: {
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  icon: {
    marginTop: 2,
  },
  text: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
  },

  // Variants
  variant_default: {
    backgroundColor: AppColors.card,
    borderLeftColor: AppColors.muted,
  },
  variant_success: {
    backgroundColor: AppColors.muted,
    borderLeftColor: AppColors.chart5,
  },
  variant_warning: {
    backgroundColor: AppColors.muted,
    borderLeftColor: AppColors.chart3,
  },
  variant_error: {
    backgroundColor: AppColors.muted,
    borderLeftColor: AppColors.destructive,
  },
  variant_info: {
    backgroundColor: AppColors.muted,
    borderLeftColor: AppColors.chart2,
  },
});

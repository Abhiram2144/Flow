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
    backgroundColor: AppColors.cardDark,
    borderLeftColor: AppColors.borderSubtle,
  },
  variant_success: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderLeftColor: '#22c55e',
  },
  variant_warning: {
    backgroundColor: 'rgba(251, 146, 60, 0.1)',
    borderLeftColor: '#fb923c',
  },
  variant_error: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderLeftColor: AppColors.error,
  },
  variant_info: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderLeftColor: '#3b82f6',
  },
});

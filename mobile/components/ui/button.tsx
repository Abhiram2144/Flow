import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { AppColors } from '@/constants/theme';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  onPress,
  children,
  style,
  textStyle,
}: ButtonProps) {
  const buttonStyle = [
    styles.button,
    styles[`variant_${variant}`],
    styles[`size_${size}`],
    disabled && styles.disabled,
    style,
  ];

  const finalTextStyle = [
    styles.text,
    styles[`textVariant_${variant}`],
    styles[`textSize_${size}`],
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <Pressable
      style={({ pressed }) => [
        buttonStyle,
        pressed && !disabled && styles.pressed,
      ]}
      onPress={onPress}
      disabled={disabled}>
      <Text style={finalTextStyle}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  disabledText: {
    opacity: 0.6,
  },

  // Variants
  variant_primary: {
    backgroundColor: AppColors.primary,
    borderWidth: 0,
  },
  variant_secondary: {
    backgroundColor: AppColors.muted,
    borderWidth: 0,
  },
  variant_outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: AppColors.primary,
  },
  variant_ghost: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  variant_destructive: {
    backgroundColor: AppColors.destructive,
    borderWidth: 0,
  },

  // Text variants
  textVariant_primary: {
    color: AppColors.primaryForeground,
  },
  textVariant_secondary: {
    color: AppColors.textPrimary,
  },
  textVariant_outline: {
    color: AppColors.primary,
  },
  textVariant_ghost: {
    color: AppColors.primary,
  },
  textVariant_destructive: {
    color: AppColors.destructiveForeground,
  },

  // Sizes
  size_sm: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  size_md: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  size_lg: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },

  textSize_sm: {
    fontSize: 13,
  },
  textSize_md: {
    fontSize: 15,
  },
  textSize_lg: {
    fontSize: 17,
  },
});

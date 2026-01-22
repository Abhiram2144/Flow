import { TextInput, StyleSheet, View, Text, TextInputProps, ViewStyle } from 'react-native';
import { AppColors } from '@/constants/theme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  prefix?: string;
}

export function Input({
  label,
  error,
  containerStyle,
  prefix,
  style,
  ...props
}: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputWrapper, error && styles.errorBorder]}>
        {prefix && <Text style={styles.prefix}>{prefix}</Text>}
        <TextInput
          style={[
            styles.input,
            prefix && styles.inputWithPrefix,
            style,
          ]}
          placeholderTextColor={AppColors.textTertiary}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: AppColors.cardDark,
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 0,
    fontSize: 15,
    color: AppColors.textPrimary,
    fontWeight: '500',
  },
  inputWithPrefix: {
    paddingHorizontal: 8,
  },
  prefix: {
    fontSize: 15,
    fontWeight: '600',
    color: AppColors.accent,
    marginRight: 4,
  },
  errorBorder: {
    borderColor: AppColors.error,
  },
  errorText: {
    fontSize: 12,
    color: AppColors.error,
    marginTop: 6,
    fontWeight: '500',
  },
});

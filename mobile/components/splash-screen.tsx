import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { AppColors } from '@/constants/theme';

export function SplashScreen() {
  return (
    <View style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Flow
      </ThemedText>
      <ThemedText style={styles.subtitle}>Aware, not alarmed.</ThemedText>
      <ActivityIndicator size="large" color={AppColors.primary} style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  title: {
    color: AppColors.primary,
  },
  subtitle: {
    color: AppColors.mutedForeground,
  },
  spinner: {
    marginTop: 24,
  },
});

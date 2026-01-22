import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';

export function SplashScreen() {
  return (
    <View style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Flow
      </ThemedText>
      <ThemedText style={styles.subtitle}>Aware, not alarmed.</ThemedText>
      <ActivityIndicator size="large" color="#D4AF37" style={styles.spinner} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1419',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  title: {
    color: '#D4AF37',
  },
  subtitle: {
    color: '#A89968',
  },
  spinner: {
    marginTop: 24,
  },
});

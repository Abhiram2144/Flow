import React, { useEffect } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

export default function AnalysisLoadingScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(main)/(tabs)');
    }, 2200);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.title}>Flow is analyzing your spending…</Text>
        <Text style={styles.subtitle}>This only takes a moment.</Text>
        <ActivityIndicator size="large" color="#D4AF37" style={styles.loader} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0D0F' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 18, color: '#EDE7DB', marginBottom: 8, textAlign: 'center', fontWeight: '600' },
  subtitle: { fontSize: 14, color: '#B8B2A7', marginBottom: 20, textAlign: 'center' },
  loader: { marginTop: 12 },
});

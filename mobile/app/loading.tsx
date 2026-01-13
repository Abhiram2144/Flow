import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { clearToken, getToken } from '@/lib/auth';
import { ApiError, getBudgetCurrent } from '@/lib/api';

export default function LoadingRouterScreen() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [retrying, setRetrying] = useState(false);

  const checkState = useCallback(async () => {
    setRetrying(true);
    setError('');
    try {
      const token = await getToken();
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }

      try {
        await getBudgetCurrent();
        router.replace('/loading-1');
      } catch (err) {
        const apiErr = err as ApiError;
        if (apiErr.status === 404) {
          router.replace('/onboarding');
          return;
        }
        if (apiErr.status === 401) {
          await clearToken();
          router.replace('/(auth)/login');
          return;
        }
        throw apiErr;
      }
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr?.message || 'Unable to check your status.');
    } finally {
      setRetrying(false);
    }
  }, [router]);

  useEffect(() => {
    checkState();
  }, [checkState]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.title}>Flow</Text>
        <Text style={styles.subtitle}>Checking your setup…</Text>
        {retrying && <ActivityIndicator size="large" color="#D4AF37" style={styles.loader} />}
        {error ? (
          <TouchableOpacity style={styles.retryButton} onPress={checkState}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0D0F' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: '700', color: '#EDE7DB', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#B8B2A7' },
  loader: { marginTop: 20 },
  retryButton: { marginTop: 16, padding: 12, borderRadius: 6, borderWidth: 1, borderColor: '#D4AF37' },
  retryText: { color: '#D4AF37', fontWeight: '600' },
});

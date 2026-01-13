import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { getToken } from '@/lib/auth';

export default function SplashScreen() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const go = async () => {
      try {
        const token = await getToken();
        setChecking(false);
        if (token) {
          router.replace('/loading');
        } else {
          router.replace('/(auth)/login');
        }
      } catch (err) {
        setChecking(false);
        router.replace('/(auth)/login');
      }
    };

    // small delay for brand moment
    const timer = setTimeout(go, 400);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.center}>
        <Text style={styles.logo}>Flow</Text>
        <Text style={styles.tagline}>Stay within your budget, calmly.</Text>
        {checking && <ActivityIndicator size="small" color="#D4AF37" style={styles.loader} />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0D0F' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  logo: { fontSize: 42, fontWeight: '700', color: '#EDE7DB', marginBottom: 12 },
  tagline: { fontSize: 14, color: '#B8B2A7', textAlign: 'center' },
  loader: { marginTop: 20 },
});

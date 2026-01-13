import React, { useCallback, useEffect, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ApiError, getBudgetCurrent, checkBankData, uploadBankStatement } from '@/lib/supabase-api';
import { clearToken, getToken } from '@/lib/auth';
import * as DocumentPicker from 'expo-document-picker';

export default function AccountScreen() {
  const router = useRouter();
  const [budget, setBudgetValue] = useState<number | null>(null);
  const [hasBank, setHasBank] = useState<boolean>(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const token = await getToken();
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }

      try {
        const b = await getBudgetCurrent();
        setBudgetValue(b.total_budget);
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

      const bankStatus = await checkBankData();
      setHasBank(bankStatus.has_bank_data);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Unable to load account.');
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  const handleLogout = async () => {
    await clearToken();
    router.replace('/(auth)/login');
  };

  const handleUploadBank = async () => {
    if (hasBank) {
      Alert.alert('Info', 'You can upload a bank statement once per month. You have already uploaded your statement.');
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      setUploading(true);
      const file = result.assets[0];
      await uploadBankStatement({
        uri: file.uri,
        name: file.name,
        type: file.mimeType ?? 'application/octet-stream',
      });

      Alert.alert('Success', 'Bank statement uploaded!');
      setHasBank(true);
    } catch (err) {
      const apiErr = err as ApiError;
      const msg = apiErr.message || 'Upload failed. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll}>
        <Text style={styles.title}>Account</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>U</Text>
          </View>
          <Text style={styles.userName}>First & Last Name</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.kicker}>Current budget</Text>
          <Text style={styles.value}>{budget !== null ? `£${budget.toFixed(0)}` : 'Loading…'}</Text>
          <TouchableOpacity style={styles.outline} onPress={() => router.push('/budget')}>
            <Text style={styles.outlineText}>Change budget</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.kicker}>Bank statement</Text>
          <Text style={styles.value}>{hasBank ? 'Uploaded' : 'Not uploaded'}</Text>
          <TouchableOpacity 
            style={[styles.outline, hasBank && styles.outlineDisabled]} 
            onPress={handleUploadBank}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#D4AF37" />
            ) : (
              <Text style={[styles.outlineText, hasBank && styles.outlineDisabledText]}>
                {hasBank ? 'Already uploaded this month' : 'Upload statement'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.outline, styles.destructive]}
          onPress={() =>
            Alert.alert('Log out', 'Are you sure you want to log out?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Log out', style: 'destructive', onPress: handleLogout },
            ])
          }
        >
          <Text style={[styles.outlineText, styles.destructiveText]}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0D0F' },
  scroll: { flex: 1, padding: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#EDE7DB', marginBottom: 24 },
  profileSection: { alignItems: 'center', marginBottom: 32 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1A1E24', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#B8B2A7' },
  userName: { fontSize: 18, fontWeight: '600', color: '#EDE7DB' },
  card: { backgroundColor: '#111417', borderRadius: 8, padding: 16, borderWidth: 1, borderColor: '#1A1E24', marginBottom: 16 },
  kicker: { color: '#B8B2A7', fontSize: 13, marginBottom: 6 },
  value: { color: '#EDE7DB', fontSize: 18, fontWeight: '700', marginBottom: 12 },
  outline: { borderWidth: 1, borderColor: '#D4AF37', borderRadius: 8, padding: 12, alignItems: 'center' },
  outlineText: { color: '#D4AF37', fontWeight: '600' },
  outlineDisabled: { borderColor: '#8C8577', opacity: 0.5 },
  outlineDisabledText: { color: '#8C8577' },
  error: { color: '#EDE7DB', marginBottom: 12 },
  destructive: { borderColor: '#ff6b6b', marginTop: 12 },
  destructiveText: { color: '#ff6b6b' },
});

import React, { useState } from 'react';
import { Alert, ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Keyboard } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { ApiError, setBudget, uploadBankStatement } from '@/lib/api';
import { getToken, clearToken } from '@/lib/auth';

export default function OnboardingScreen() {
  const router = useRouter();
  const [budget, setBudgetAmount] = useState('');
  const [occupation, setOccupation] = useState('');
  const [file, setFile] = useState<{ uri: string; name: string; type?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['text/csv', 'application/pdf'],
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    setFile({ uri: asset.uri, name: asset.name, type: asset.mimeType ?? 'application/octet-stream' });
  };

  const handleSubmit = async () => {
    setError('');
    const value = parseFloat(budget);
    if (Number.isNaN(value) || value <= 0) {
      setError('Enter a valid monthly budget.');
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }

      await setBudget(value);

      if (file) {
        try {
          await uploadBankStatement(file);
        } catch (uploadErr) {
          const message = (uploadErr as Error).message || 'Bank statement upload failed.';
          Alert.alert('Upload issue', message);
        }
      }

      router.replace('/loading-1');
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.status === 401) {
        await clearToken();
        router.replace('/(auth)/login');
        return;
      }
      if (apiErr.status === 400) {
        setError('Please enter a valid budget amount.');
        return;
      }
      setError(apiErr.message || 'Could not save your setup.');
    } finally {
      setLoading(false);
    }
  };

  const canContinue = !!budget && !loading;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Finish setting up Flow</Text>
          <Text style={styles.subtitle}>Budget is required. Statement upload is optional but recommended.</Text>

          <View style={styles.card}>
            <Text style={styles.label}>Monthly budget</Text>
          <TextInput
            style={styles.input}
            placeholder="£2000"
            placeholderTextColor="#8C8577"
            keyboardType="decimal-pad"
            value={budget}
            onChangeText={setBudgetAmount}
            onBlur={() => Keyboard.dismiss()}
          />
            <Text style={styles.hint}>We use this to calculate your daily target.</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Upload bank statement (optional)</Text>
          <TouchableOpacity style={styles.outlineButton} onPress={pickFile} activeOpacity={0.8}>
            <Text style={styles.outlineButtonText}>{file ? `Selected: ${file.name}` : 'Upload CSV or PDF'}</Text>
          </TouchableOpacity>
            <Text style={styles.hint}>Recommended for instant momentum. CSV format: date, amount, merchant.</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Occupation (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Product designer"
            placeholderTextColor="#8C8577"
            value={occupation}
            onChangeText={setOccupation}
            onBlur={() => Keyboard.dismiss()}
          />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
          style={[styles.primaryButton, !canContinue && styles.primaryButtonDisabled]}
            onPress={handleSubmit}
          activeOpacity={0.8}
          disabled={!canContinue}
        >
            {loading ? <ActivityIndicator color="#0B0D0F" /> : <Text style={styles.primaryText}>Let's go</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0D0F' },
  content: { paddingHorizontal: 24, paddingVertical: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#EDE7DB', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#B8B2A7', marginBottom: 20 },
  card: { backgroundColor: '#111417', padding: 16, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#1A1E24' },
  label: { color: '#EDE7DB', fontSize: 14, marginBottom: 8, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#2A2E35',
    borderRadius: 6,
    padding: 14,
    fontSize: 16,
    color: '#EDE7DB',
    backgroundColor: '#0B0D0F',
  },
  hint: { color: '#8C8577', fontSize: 12, marginTop: 8, lineHeight: 18 },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  outlineButtonText: { color: '#D4AF37', fontWeight: '600' },
  primaryButton: {
    backgroundColor: '#D4AF37',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  primaryButtonDisabled: { opacity: 0.4 },
  primaryText: { color: '#0B0D0F', fontWeight: '700', fontSize: 16 },
  error: { color: '#EDE7DB', marginTop: 8, fontSize: 13 },
});

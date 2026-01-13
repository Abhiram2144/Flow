import React, { useState } from 'react';
import { Alert, ActivityIndicator, KeyboardAvoidingView, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { setBudget, ApiError } from '@/lib/supabase-api';
import { clearToken } from '@/lib/auth';

export default function BudgetScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError('');
    const value = parseFloat(amount);
    if (Number.isNaN(value) || value <= 0) {
      setError('Enter a valid amount.');
      return;
    }

    setLoading(true);
    try {
      await setBudget(value);
      Alert.alert('Success', 'Budget set successfully!', [
        { text: 'OK', onPress: () => router.replace('/(main)/(tabs)' as any) }
      ]);
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.status === 401) {
        await clearToken();
        router.replace('/(auth)/login');
        return;
      }
      if (apiErr.status === 400) {
        setError('Invalid amount. Please enter a positive number.');
        return;
      }
      setError(apiErr.message || 'Could not set budget. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = !!amount && !loading;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <View style={styles.content}>
          <Text style={styles.heading}>Set your monthly budget</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.largeInput}
              placeholder="£2000"
              placeholderTextColor="#8C8577"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />
            <Text style={styles.helperText}>You can change this anytime in Account.</Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>

          <TouchableOpacity
            style={[styles.button, !canSubmit && styles.buttonDisabled]}
            onPress={onSubmit}
            disabled={!canSubmit}
            activeOpacity={0.8}
          >
            {loading ? <ActivityIndicator color="#0B0D0F" /> : <Text style={styles.buttonText}>Continue</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#0B0D0F' },
  content: { flex: 1, padding: 24, paddingTop: 40, justifyContent: 'flex-start' },
  heading: { fontSize: 24, fontWeight: '700', color: '#EDE7DB', marginBottom: 48 },
  form: { marginBottom: 64 },
  largeInput: {
    fontSize: 48,
    fontWeight: '700',
    color: '#EDE7DB',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2E35',
    paddingBottom: 8,
  },
  helperText: { fontSize: 13, color: '#B8B2A7' },
  button: { backgroundColor: '#D4AF37', padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#0B0D0F', fontSize: 16, fontWeight: '700' },
  error: { color: '#EDE7DB', marginTop: 12, fontSize: 13 },
});

import React, { useState } from 'react';
import { Alert, ActivityIndicator, KeyboardAvoidingView, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { addTransaction, ApiError } from '@/lib/supabase-api';
import { clearToken } from '@/lib/auth';

export default function AddTransactionScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSave = async () => {
    setError('');
    const value = parseFloat(amount);
    if (Number.isNaN(value) || value <= 0 || !merchant.trim()) {
      setError('Please fill in amount and merchant.');
      return;
    }

    setLoading(true);
    try {
      await addTransaction({ amount: value, merchant: merchant.trim(), date });
      Alert.alert('Success', 'Transaction added!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.status === 401) {
        await clearToken();
        router.replace('/(auth)/login');
        return;
      }
      setError(apiErr.message || 'Could not save transaction.');
    } finally {
      setLoading(false);
    }
  };

  const canSave = !!amount && !!merchant.trim() && !!date && !loading;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <View style={styles.content}>
          <Text style={styles.heading}>Add expense</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Amount</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0"
              placeholderTextColor="#8C8577"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
            />

            <Text style={styles.label}>Merchant</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Tesco"
              placeholderTextColor="#8C8577"
              value={merchant}
              onChangeText={setMerchant}
            />

            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#8C8577"
              value={date}
              onChangeText={setDate}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>

          <TouchableOpacity
            style={[styles.button, !canSave && styles.buttonDisabled]}
            onPress={onSave}
            disabled={!canSave}
          >
            {loading ? <ActivityIndicator color="#0B0D0F" /> : <Text style={styles.buttonText}>Save</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0D0F' },
  flex: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: 'flex-start' },
  heading: { fontSize: 24, fontWeight: '700', color: '#EDE7DB', marginBottom: 24 },
  form: { marginBottom: 24 },
  label: { color: '#B8B2A7', fontSize: 14, marginBottom: 6, fontWeight: '600' },
  amountInput: {
    fontSize: 40,
    fontWeight: '700',
    color: '#EDE7DB',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2E35',
    paddingBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#2A2E35',
    borderRadius: 6,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#111417',
    color: '#EDE7DB',
  },
  button: { backgroundColor: '#D4AF37', padding: 16, borderRadius: 6, alignItems: 'center' },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#0B0D0F', fontSize: 16, fontWeight: '700' },
  error: { color: '#EDE7DB', marginTop: 12, fontSize: 13 },
});

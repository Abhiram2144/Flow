import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import { addTransaction, ApiError } from '../../lib/api';

export default function AddTransactionScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [error, setError] = useState('');

  const onSave = async () => {
    setError('');
    const value = parseFloat(amount);
    if (Number.isNaN(value) || value <= 0 || !merchant.trim()) {
      setError('Please fill in all fields');
      return;
    }
    try {
      await addTransaction({ amount: value, merchant: merchant.trim(), date });
      router.back();
    } catch (err) {
      const status = (err as ApiError).status;
      if (status === 401) {
        router.replace('/(auth)/login' as any);
        return;
      }
      setError('Could not save transaction');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.heading}>Add expense</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.amountInput}
            placeholder="0"
            placeholderTextColor="#ccc"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />

          <TextInput
            style={styles.input}
            placeholder="Merchant"
            placeholderTextColor="#999"
            value={merchant}
            onChangeText={setMerchant}
          />

          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#999"
            value={date}
            onChangeText={setDate}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>

        <TouchableOpacity style={styles.button} onPress={onSave}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 24, paddingBottom: 12 },
  backButton: { fontSize: 16, color: '#000', fontWeight: '500' },
  content: { flex: 1, padding: 24, paddingTop: 0, justifyContent: 'flex-start' },
  heading: { fontSize: 24, fontWeight: '600', color: '#000', marginBottom: 32 },
  form: { marginBottom: 40 },
  amountInput: { 
    fontSize: 40, 
    fontWeight: '600',
    color: '#000',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 8,
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 6, 
    padding: 14, 
    fontSize: 16, 
    marginBottom: 16,
    backgroundColor: '#fff',
    color: '#000',
  },
  button: { backgroundColor: '#000', padding: 16, borderRadius: 6, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  error: { color: '#333', marginTop: 12, fontSize: 13 },
});
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import { setBudget, ApiError } from '../../lib/api';

export default function BudgetScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async () => {
    setError('');
    const value = parseFloat(amount);
    if (Number.isNaN(value) || value <= 0) {
      setError('Enter a valid amount');
      return;
    }
    try {
      await setBudget(value);
      router.replace('/');
    } catch (err) {
      const status = (err as ApiError).status;
      if (status === 401) {
        router.replace('/(auth)/login' as any);
        return;
      }
      setError('Could not set budget');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.content}>
        <Text style={styles.heading}>Set your monthly budget</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.largeInput}
            placeholder="£2000"
            placeholderTextColor="#ccc"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />
          <Text style={styles.helperText}>You can change this later.</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>

        <TouchableOpacity style={styles.button} onPress={onSubmit}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, padding: 24, paddingTop: 40, justifyContent: 'flex-start' },
  heading: { fontSize: 24, fontWeight: '600', color: '#000', marginBottom: 48 },
  form: { marginBottom: 64 },
  largeInput: { 
    fontSize: 48, 
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 8,
  },
  helperText: { fontSize: 13, color: '#999' },
  button: { backgroundColor: '#000', padding: 16, borderRadius: 6, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  error: { color: '#333', marginTop: 12, fontSize: 13 },
});
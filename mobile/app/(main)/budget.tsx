import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, SafeAreaView, Alert } from 'react-native';
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
      Alert.alert('Success', 'Budget set successfully!', [
        { text: 'OK', onPress: () => router.replace('/') }
      ]);
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
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
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

        <TouchableOpacity style={styles.button} onPress={onSubmit} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Continue</Text>
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
  heading: { fontSize: 24, fontWeight: '600', color: '#EDE7DB', marginBottom: 48 },
  form: { marginBottom: 64 },
  largeInput: {
    fontSize: 48,
    fontWeight: '600',
    color: '#EDE7DB',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2E35',
    paddingBottom: 8,
  },
  helperText: { fontSize: 13, color: '#B8B2A7' },
  button: { backgroundColor: '#D4AF37', padding: 16, borderRadius: 6, alignItems: 'center' },
  buttonText: { color: '#0B0D0F', fontSize: 16, fontWeight: '600' },
  error: { color: '#EDE7DB', marginTop: 12, fontSize: 13 },
});
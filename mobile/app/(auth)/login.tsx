import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { login } from '@/lib/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter email and password');
      return;
    }
    
    setLoading(true);
    try {
      await login(email.trim(), password);
      // Supabase session is now set automatically
      // Root layout will detect session and redirect to /(main)/(tabs)
    } catch (err: any) {
      setLoading(false);
      if (err.message?.includes('Invalid login')) {
        setError('Invalid email or password');
      } else if (err.message?.includes('Email not confirmed')) {
        setError('Please verify your email address');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <View style={styles.content}>
        <Text style={styles.appName}>Flow</Text>
        <Text style={styles.subtitle}>Stay within your budget, calmly.</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={onSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.push('/(auth)/signup' as any)} disabled={loading}>
          <Text style={styles.link}>Create an account</Text>
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#0B0D0F' },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  appName: { fontSize: 36, fontWeight: '700', color: '#EDE7DB', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#B8B2A7', marginBottom: 48, textAlign: 'center' },
  form: { marginBottom: 32 },
  input: {
    borderWidth: 1,
    borderColor: '#2A2E35',
    borderRadius: 6,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#111417',
    color: '#EDE7DB',
  },
  button: { backgroundColor: '#D4AF37', padding: 16, borderRadius: 6, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#0B0D0F', fontSize: 16, fontWeight: '600' },
  error: { color: '#EDE7DB', marginBottom: 12, fontSize: 13, textAlign: 'center' },
  link: { color: '#B8B2A7', fontSize: 14, textAlign: 'center' },
});
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import { login, ApiError } from '../../lib/api';
import { setToken } from '../../lib/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async () => {
    setError('');
    try {
      const { access_token } = await login(email.trim(), password);
      await setToken(access_token);
      router.replace('/');
    } catch (err) {
      const status = (err as ApiError).status;
      setError(status === 401 ? 'Invalid credentials' : 'Login failed');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
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
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={styles.button} onPress={onSubmit}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.push('/(auth)/signup' as any)}>
          <Text style={styles.link}>Create an account</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  appName: { fontSize: 36, fontWeight: '700', color: '#000', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 48, textAlign: 'center' },
  form: { marginBottom: 32 },
  input: { 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 6, 
    padding: 16, 
    fontSize: 16, 
    marginBottom: 16,
    backgroundColor: '#fff',
    color: '#000',
  },
  button: { backgroundColor: '#000', padding: 16, borderRadius: 6, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  error: { color: '#333', marginBottom: 12, fontSize: 13, textAlign: 'center' },
  link: { color: '#666', fontSize: 14, textAlign: 'center' },
});
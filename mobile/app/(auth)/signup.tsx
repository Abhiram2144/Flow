import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { register, ApiError } from '../../lib/api';
import { setToken } from '../../lib/auth';

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async () => {
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    try {
      const { access_token } = await register(email.trim(), password);
      await setToken(access_token);
      Alert.alert('Success', 'Account created successfully!', [
        { text: 'OK', onPress: () => router.replace('/budget' as any) }
      ]);
    } catch (err) {
      const status = (err as ApiError).status;
      setError(status === 409 ? 'Email already exists' : 'Registration failed');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <View style={styles.content}>
        <Text style={styles.appName}>Flow</Text>
        <Text style={styles.subtitle}>Create your account</Text>

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
            <Text style={styles.buttonText}>Create Account</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.link}>Back to Sign In</Text>
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0D0F' },
  flex: { flex: 1 },
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
  buttonText: { color: '#0B0D0F', fontSize: 16, fontWeight: '600' },
  error: { color: '#EDE7DB', marginBottom: 12, fontSize: 13, textAlign: 'center' },
  link: { color: '#B8B2A7', fontSize: 14, textAlign: 'center' },
});

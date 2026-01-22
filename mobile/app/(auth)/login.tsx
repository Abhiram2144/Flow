import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View, Text } from 'react-native';
import { Link, useRouter } from 'expo-router';

import { AppColors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const { signIn, profile } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    setSubmitting(true);
    const result = await signIn(email.trim().toLowerCase(), password);
    setSubmitting(false);

    if (result?.error) {
      Alert.alert('Login issue', result.error);
      return;
    }

    if (profile?.monthly_budget) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/onboarding');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>
          Flow keeps you aware, not alarmed. Sign in to continue.
        </Text>
        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
            style={styles.input}
            placeholderTextColor="#8C8577"
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            style={styles.input}
            placeholderTextColor="#8C8577"
          />
        </View>
        <Pressable style={[styles.button, submitting && styles.buttonDisabled]} onPress={onSubmit} disabled={submitting}>
          <Text style={styles.buttonText}>
            {submitting ? 'Signing in…' : 'Login'}
          </Text>
        </Pressable>
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>New to Flow?</Text>
          <Link href="/(auth)/signup" asChild>
            <Pressable>
              <Text style={styles.linkText}>Create account</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: AppColors.background,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    gap: 20,
    backgroundColor: AppColors.cardDark,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: AppColors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: AppColors.textSecondary,
    marginBottom: 8,
  },
  field: {
    gap: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: AppColors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: AppColors.textPrimary,
    backgroundColor: AppColors.background,
  },
  button: {
    backgroundColor: AppColors.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
  linkText: {
    fontSize: 14,
    color: AppColors.accent,
    fontWeight: '600',
  },
});

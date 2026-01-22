import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function OnboardingScreen() {
  const { upsertBudget } = useAuth();
  const router = useRouter();
  const [budget, setBudget] = useState('');
  const [saving, setSaving] = useState(false);

  const onContinue = async () => {
    const value = Number(budget);
    if (!value || value <= 0) {
      Alert.alert('Add a monthly budget', 'Enter your monthly amount to pace spending.');
      return;
    }

    setSaving(true);
    const result = await upsertBudget(value);
    setSaving(false);

    if (result?.error) {
      Alert.alert('Could not save budget', result.error);
      return;
    }

    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <ThemedView style={styles.card}>
        <ThemedText type="title">Set your monthly flow</ThemedText>
        <ThemedText style={styles.subtitle}>
          A simple monthly budget keeps momentum honest. Adjust anytime in Account.
        </ThemedText>
        <TextInput
          value={budget}
          onChangeText={setBudget}
          keyboardType="decimal-pad"
          placeholder="$2,400"
          style={styles.input}
          placeholderTextColor={Colors.light.icon}
        />
        <Pressable style={[styles.button, saving && styles.buttonDisabled]} onPress={onContinue} disabled={saving}>
          <ThemedText type="defaultSemiBold" style={styles.buttonText}>
            {saving ? 'Saving…' : 'Continue'}
          </ThemedText>
        </Pressable>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#0F1419',
  },
  card: {
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  subtitle: {
    color: '#A89968',
  },
  input: {
    borderWidth: 1,
    borderColor: '#2A2F3E',
    borderRadius: 12,
    padding: 12,
    fontSize: 18,
    color: '#F5E6D3',
    backgroundColor: '#1A1F2E',
  },
  button: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#0F1419',
    fontSize: 16,
  },
});

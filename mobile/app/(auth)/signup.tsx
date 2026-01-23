import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';

import { AppColors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

type SignupStep = 1 | 2 | 3;

export default function SignupScreen() {
  const { signUp, updateProfile } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<SignupStep>(1);
    const insets = useSafeAreaInsets();

  // Step 1: Auth
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submittingStep1, setSubmittingStep1] = useState(false);

  // Step 2: Personal Details
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [occupation, setOccupation] = useState('');
  const [submittingStep2, setSubmittingStep2] = useState(false);

  // Step 3: Budget
  const [budget, setBudget] = useState('');
  const [submittingStep3, setSubmittingStep3] = useState(false);

  const onStep1Continue = async () => {
    if (!email.trim() || !password || !confirmPassword) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Please ensure both passwords are the same.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters.');
      return;
    }

    setSubmittingStep1(true);
    const result = await signUp(email.trim().toLowerCase(), password);
    setSubmittingStep1(false);

    if (result?.error) {
      Alert.alert('Could not create account', result.error);
      return;
    }

    setStep(2);
  };

  const onStep2Continue = async () => {
    if (!name.trim()) {
      Alert.alert('Missing name', 'Please enter your name.');
      return;
    }
    if (!dob.trim()) {
      Alert.alert('Missing DOB', 'Please enter your date of birth (YYYY-MM-DD).');
      return;
    }
    if (!occupation.trim()) {
      Alert.alert('Missing occupation', 'Please enter your occupation.');
      return;
    }

    setSubmittingStep2(true);
    const result = await updateProfile({ name: name.trim(), dob: dob.trim(), occupation: occupation.trim() });
    setSubmittingStep2(false);

    if (result?.error) {
      Alert.alert('Could not save details', result.error);
      return;
    }

    setStep(3);
  };

  const onStep3Continue = async () => {
    const value = Number(budget);
    if (!value || value <= 0) {
      Alert.alert('Add a monthly budget', 'Enter your monthly amount to pace spending.');
      return;
    }

    setSubmittingStep3(true);
    const result = await updateProfile({ monthly_budget: value });
    setSubmittingStep3(false);

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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}> 
          {step === 1 && (
            <View style={styles.card}>
              <Text style={styles.title}>Create your Flow</Text>
              <Text style={styles.subtitle}>Step 1 of 3 • Authentication</Text>
              <View style={styles.field}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholder="you@example.com"
                  style={styles.input}
                  placeholderTextColor={AppColors.mutedForeground}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="At least 8 characters"
                  style={styles.input}
                  placeholderTextColor={AppColors.mutedForeground}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholder="Confirm your password"
                  style={styles.input}
                  placeholderTextColor={AppColors.mutedForeground}
                />
              </View>
              <Pressable
                style={[styles.button, submittingStep1 && styles.buttonDisabled]}
                onPress={onStep1Continue}
                disabled={submittingStep1}>
                <Text style={styles.buttonText}>
                  {submittingStep1 ? 'Continue…' : 'Continue'}
                </Text>
              </Pressable>
              <View style={styles.footerRow}>
                <Text style={styles.footerText}>Have an account?</Text>
                <Link href="/(auth)/login" asChild>
                  <Pressable>
                    <Text style={styles.linkText}>Log in</Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={styles.card}>
              <Text style={styles.title}>Tell us about you</Text>
              <Text style={styles.subtitle}>Step 2 of 3 • Personal Details</Text>
              <View style={styles.field}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="John Doe"
                  style={styles.input}
                  placeholderTextColor={AppColors.mutedForeground}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Date of Birth</Text>
                <TextInput
                  value={dob}
                  onChangeText={setDob}
                  placeholder="YYYY-MM-DD"
                  style={styles.input}
                  placeholderTextColor={AppColors.mutedForeground}
                />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Occupation</Text>
                <TextInput
                  value={occupation}
                  onChangeText={setOccupation}
                  placeholder="Software Engineer"
                  style={styles.input}
                  placeholderTextColor={AppColors.mutedForeground}
                />
              </View>
              <Pressable
                style={[styles.button, submittingStep2 && styles.buttonDisabled]}
                onPress={onStep2Continue}
                disabled={submittingStep2}>
                <Text style={styles.buttonText}>
                  {submittingStep2 ? 'Continue…' : 'Continue'}
                </Text>
              </Pressable>
            </View>
          )}

          {step === 3 && (
            <View style={styles.card}>
              <Text style={styles.title}>Set your monthly flow</Text>
              <Text style={styles.subtitle}>Step 3 of 3 • Budget Setup</Text>
              <View style={styles.field}>
                <Text style={styles.label}>Monthly Budget</Text>
                <TextInput
                  value={budget}
                  onChangeText={setBudget}
                  keyboardType="decimal-pad"
                  placeholder="$2,400"
                  style={styles.input}
                  placeholderTextColor={AppColors.mutedForeground}
                />
              </View>
              <Pressable
                style={[styles.button, submittingStep3 && styles.buttonDisabled]}
                onPress={onStep3Continue}
                disabled={submittingStep3}>
                <Text style={styles.buttonText}>
                  {submittingStep3 ? 'Setting up…' : 'Get started'}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    gap: 20,
    backgroundColor: AppColors.card,
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
    color: AppColors.accent,
    backgroundColor: AppColors.background,
  },
  button: {
    backgroundColor: AppColors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: AppColors.primaryForeground,
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

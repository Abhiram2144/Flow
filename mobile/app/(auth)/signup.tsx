import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, SafeAreaView, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { register } from '@/lib/auth';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function SignupScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dob, setDob] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [agreeToPolicy, setAgreeToPolicy] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios'); // Keep open on iOS
    if (selectedDate) {
      setDob(selectedDate);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const onSubmit = async () => {
    setError('');
    
    // Validation
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!email.trim() || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!agreeToPolicy) {
      setError('Please agree to privacy policy to continue');
      return;
    }
    
    setLoading(true);
    try {
      await register(email.trim(), password);
      // Supabase session is now set automatically
      // Root layout will detect session and redirect to /(main)/(tabs)
      Alert.alert('Success', 'Account created! Please check your email to verify your account.', [
        { text: 'OK' }
      ]);
    } catch (err: any) {
      setLoading(false);
      if (err.message?.includes('already registered')) {
        setError('Email already registered. Please sign in instead.');
      } else if (err.message?.includes('Password')) {
        setError('Password is too weak. Use at least 6 characters.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
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
            placeholder="First & Last Name"
            placeholderTextColor="#999"
            autoCapitalize="words"
            value={fullName}
            onChangeText={setFullName}
            editable={!loading}
          />

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
            placeholder="Password (min 6 characters)"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#999"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            editable={!loading}
          />

          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
            disabled={loading}
          >
            <Text style={[styles.dateText, !dob && styles.placeholderText]}>
              {dob ? formatDate(dob) : 'Date of Birth (Optional)'}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={dob || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          )}

          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => setAgreeToPolicy(!agreeToPolicy)}
            disabled={loading}
          >
            <View style={[styles.checkbox, agreeToPolicy && styles.checkboxChecked]}>
              {agreeToPolicy && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>I agree to privacy and policy</Text>
          </TouchableOpacity>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={onSubmit}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Sign Up'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.back()} disabled={loading}>
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
    justifyContent: 'center',
  },
  dateText: { color: '#EDE7DB', fontSize: 16 },
  placeholderText: { color: '#999' },
  button: { backgroundColor: '#D4AF37', padding: 16, borderRadius: 6, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { backgroundColor: '#6B5F4D', padding: 16, borderRadius: 6, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#0B0D0F', fontSize: 16, fontWeight: '600' },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginTop: 4 },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#2A2E35',
    borderRadius: 4,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111417',
  },
  checkboxChecked: { backgroundColor: '#D4AF37', borderColor: '#D4AF37' },
  checkmark: { color: '#0B0D0F', fontSize: 14, fontWeight: 'bold' },
  checkboxLabel: { color: '#B8B2A7', fontSize: 14 },
  error: { color: '#EDE7DB', marginBottom: 12, fontSize: 13, textAlign: 'center' },
  link: { color: '#B8B2A7', fontSize: 14, textAlign: 'center' },
});

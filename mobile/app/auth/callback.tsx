import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    handleAuthCallback();
  }, []);

  const handleAuthCallback = async () => {
    try {
      // Get the token hash from URL params
      const { token_hash, type } = params as { token_hash?: string; type?: string };

      if (!token_hash || type !== 'email') {
        setStatus('error');
        setMessage('Invalid verification link. Please try again.');
        setTimeout(() => router.replace('/(auth)/login'), 3000);
        return;
      }

      // Verify the OTP token
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: 'email',
      });

      if (error) {
        console.error('Email verification error:', error);
        setStatus('error');
        setMessage('Verification failed. Please request a new link.');
        setTimeout(() => router.replace('/(auth)/login'), 3000);
        return;
      }

      if (data.session) {
        setStatus('success');
        setMessage('Email verified! Redirecting...');
        // Small delay to show success message
        setTimeout(() => {
          router.replace('/onboarding');
        }, 1500);
      } else {
        setStatus('error');
        setMessage('Unable to verify. Please try logging in.');
        setTimeout(() => router.replace('/(auth)/login'), 3000);
      }
    } catch (err) {
      console.error('Callback error:', err);
      setStatus('error');
      setMessage('Something went wrong. Please try again.');
      setTimeout(() => router.replace('/(auth)/login'), 3000);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {status === 'processing' && (
          <>
            <ActivityIndicator size="large" color="#D4AF37" />
            <Text style={styles.message}>{message}</Text>
          </>
        )}
        {status === 'success' && (
          <>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.message}>{message}</Text>
          </>
        )}
        {status === 'error' && (
          <>
            <Text style={styles.errorIcon}>✕</Text>
            <Text style={styles.message}>{message}</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0D0F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 24,
  },
  message: {
    color: '#EDE7DB',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 24,
  },
  successIcon: {
    fontSize: 64,
    color: '#4CAF50',
  },
  errorIcon: {
    fontSize: 64,
    color: '#F44336',
  },
});

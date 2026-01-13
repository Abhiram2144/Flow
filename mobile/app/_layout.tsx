import { Slot, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';

import { supabase } from '../lib/supabase';

const PUBLIC_SEGMENTS = ['(auth)', 'splash', 'loading', 'onboarding', 'auth'];

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const segments = useSegments();
  const router = useRouter();

  // Handle deep links for email verification
  useEffect(() => {
    const handleDeepLink = ({ url }: { url: string }) => {
      const parsed = Linking.parse(url);
      
      // Check if it's an auth callback
      if (parsed.path === 'auth/callback' || parsed.hostname === 'auth') {
        const params = parsed.queryParams;
        if (params?.token_hash) {
          router.push({
            pathname: '/auth/callback',
            params: {
              token_hash: params.token_hash,
              type: params.type || 'email',
            },
          } as any);
        }
      }
    };

    // Handle initial URL if app was opened from link
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    // Listen for incoming links while app is running
    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => subscription.remove();
  }, [router]);

  // Initialize and listen to auth state changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setReady(true);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!ready) return;
    
    const currentSegments = segments as string[];
    const first = currentSegments[0];
    const inPublic = PUBLIC_SEGMENTS.includes(first as string);
    const inAuth = currentSegments.includes('(auth)');
    const inAuthCallback = currentSegments.includes('auth') && currentSegments.includes('callback');

    // Skip routing if we're in the auth callback screen
    if (inAuthCallback) return;

    // Add a small delay to allow navigation to complete before checking
    const timer = setTimeout(() => {
      if (!session && !inPublic && first !== '(auth)') {
        router.replace('/splash' as any);
      } else if (session && inAuth) {
        router.replace('/(main)/(tabs)' as any);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [ready, session, segments, router]);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B0D0F' }}>
        <ActivityIndicator color="#D4AF37" />
      </View>
    );
  }

  return <Slot />;
}

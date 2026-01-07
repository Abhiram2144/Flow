import { Slot, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { getToken } from '../lib/auth';

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [token, setTokenState] = useState<string | null>(null);
  const segments = useSegments();
  const router = useRouter();

  const loadToken = async () => {
    const stored = await getToken();
    setTokenState(stored);
    setReady(true);
  };

  useEffect(() => {
    loadToken();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadToken();
    }, [])
  );

  useEffect(() => {
    if (!ready) return;
    const inAuth = (segments as string[]).includes('(auth)');
    if (!token && !inAuth) router.replace('/(auth)/login' as any);
    else if (token && inAuth) router.replace('/');
  }, [ready, token, segments, router]);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f7f7f7' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <Slot />;
}

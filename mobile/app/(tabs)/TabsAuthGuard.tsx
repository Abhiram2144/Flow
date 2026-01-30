import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function TabsAuthGuard({ children }: { children: React.ReactNode }) {
  const { session, authReady, profile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authReady) return;
    if (!session) {
      router.replace('/(auth)/login');
    } else if (session && !profile?.monthly_budget) {
      router.replace('/(auth)/onboarding');
    }
  }, [authReady, session, profile, router]);

  if (!authReady || !session || !profile?.monthly_budget) {
    // Optionally show a loading spinner here
    return null;
  }
  return <>{children}</>;
}

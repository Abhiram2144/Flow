import { PropsWithChildren, createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';
import type { UserProfile } from '@/types/database';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  authReady: boolean;
  refreshProfile: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: string } | void>;
  signUp: (email: string, password: string) => Promise<{ error?: string } | void>;
  signOut: () => Promise<void>;
  upsertBudget: (budget: number) => Promise<{ error?: string } | void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error?: string } | void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.warn('Failed to fetch profile', error.message);
    return null;
  }

  return data;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let active = true;

    const init = async () => {
      const {
        data: { session: initialSession },
      } = await supabase.auth.getSession();

      if (!active) return;

      setSession(initialSession);
      setUser(initialSession?.user ?? null);

      if (initialSession?.user) {
        const loaded = await fetchProfile(initialSession.user.id);
        if (!active) return;
        setProfile(loaded);
      }

      setAuthReady(true);
    };

    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, nextSession: Session | null) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      if (nextSession?.user) {
        const loaded = await fetchProfile(nextSession.user.id);
        setProfile(loaded);
      } else {
        setProfile(null);
      }
    },
    );

    init();

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (!user) return;
    const next = await fetchProfile(user.id);
    setProfile(next);
  };

  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    const nextUser = data.user ?? user;
    if (nextUser) {
      const loaded = await fetchProfile(nextUser.id);
      setProfile(loaded);
    }
  };

  const signUp = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };

    const newUserId = data.user?.id;
    if (newUserId) {
      const { error: profileError } = await supabase.from('users').upsert({
        id: newUserId,
        email,
      });
      if (profileError) return { error: profileError.message };
      const loaded = await fetchProfile(newUserId);
      setProfile(loaded);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const upsertBudget = async (budget: number) => {
    if (!user) return { error: 'No user' };
    const { error } = await supabase
      .from('users')
      .upsert({ id: user.id, monthly_budget: budget })
      .eq('id', user.id);
    if (error) return { error: error.message };
    await refreshProfile();
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return { error: 'No user' };
    const { error } = await supabase
      .from('users')
      .upsert({ id: user.id, ...data })
      .eq('id', user.id);
    if (error) return { error: error.message };
    await refreshProfile();
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      profile,
      authReady,
      refreshProfile,
      signIn,
      signUp,
      signOut,
      upsertBudget,
      updateProfile,
    }),
    [authReady, profile, session, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

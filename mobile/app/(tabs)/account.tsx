import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { AppColors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Input,
  Alert as AlertComponent,
} from '@/components/ui';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { Expense } from '@/types/database';

export default function AccountScreen() {
  const { profile, upsertBudget, signOut, user } = useAuth();
  const [budget, setBudget] = useState(String(profile?.monthly_budget ?? ''));
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setBudget(profile?.monthly_budget ? String(profile.monthly_budget) : '');
  }, [profile?.monthly_budget]);

  const onSaveBudget = async () => {
    const value = Number(budget);
    if (!value || value <= 0) {
      Alert.alert('Enter a budget', 'Use a positive monthly amount.');
      return;
    }
    setSaving(true);
    const result = await upsertBudget(value);
    setSaving(false);
    if (result?.error) Alert.alert('Could not save budget', result.error);
    else Alert.alert('Budget updated', 'We will use this to track momentum.');
  };

  const onExport = async () => {
    if (!user) return;
    setExporting(true);
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true });
    setExporting(false);

    if (error) {
      Alert.alert('Could not export', error.message);
      return;
    }

    const header = 'date,category,merchant,amount\n';
    const rows = (data ?? []).map((e: Expense) => `${e.date},${e.category},${e.merchant ?? ''},${e.amount}`);
    const csv = header + rows.join('\n');
    const uri = `${FileSystem.cacheDirectory}flow-export.csv`;
    await FileSystem.writeAsStringAsync(uri, csv, { encoding: 'utf8' });
    await Sharing.shareAsync(uri, { mimeType: 'text/csv', dialogTitle: 'Flow export' });
  };

  const onDeleteAccount = async () => {
    if (!user) return;
    Alert.alert('Delete account', 'This removes your data in Flow. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          await supabase.from('expenses').delete().eq('user_id', user.id);
          await supabase.from('users').delete().eq('id', user.id);
          setDeleting(false);
          await signOut();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.name?.[0]?.toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.userName}>{profile?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Budget Card */}
        <Card variant="default">
          <CardHeader>
            <Text style={styles.sectionTitle}>📊 Monthly Budget</Text>
          </CardHeader>
          <CardContent style={styles.cardGap}>
            <Input
              label="Budget Amount"
              prefix="£"
              placeholder="0"
              value={budget}
              onChangeText={setBudget}
              keyboardType="numeric"
            />
            <Button
              variant="primary"
              size="md"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onSaveBudget();
              }}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save Budget'}
            </Button>
          </CardContent>
        </Card>



        {/* Bank Statement Card */}
        <Card variant="default">
          <CardHeader>
            <Text style={styles.sectionTitle}>🏦 Bank Statement</Text>
          </CardHeader>
          <CardContent style={styles.cardGap}>
            <Text style={styles.comingSoonText}>Feature coming soon</Text>
            <Button
              variant="outline"
              size="md"
              disabled
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              Upload Statement
            </Button>
          </CardContent>
        </Card>

        {/* Data Management Card */}
        <Card variant="default">
          <CardHeader>
            <Text style={styles.sectionTitle}>📥 Data Management</Text>
          </CardHeader>
          <CardContent style={styles.cardGap}>
            <Button
              variant="secondary"
              size="md"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onExport();
              }}
              disabled={exporting}
            >
              {exporting ? 'Preparing...' : '⬇️ Export as CSV'}
            </Button>
          </CardContent>
        </Card>

        {/* Session Card */}
        <Card variant="default">
          <CardHeader>
            <Text style={styles.sectionTitle}>🔐 Session</Text>
          </CardHeader>
          <CardContent style={styles.cardGap}>
            <Button
              variant="outline"
              size="md"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                Alert.alert(
                  'Logout',
                  'Are you sure you want to logout?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Logout',
                      style: 'destructive',
                      onPress: signOut,
                    },
                  ]
                );
              }}
            >
              Logout
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone Card */}
        <Card variant="outline">
          <CardHeader>
            <Text style={[styles.sectionTitle, styles.dangerText]}>⚠️ Danger Zone</Text>
          </CardHeader>
          <CardContent style={styles.cardGap}>
            <AlertComponent
              variant="error"
              message="Deleting your account will permanently remove all your data from Flow."
            />
            <Button
              variant="destructive"
              size="md"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                onDeleteAccount();
              }}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Account'}
            </Button>
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
    gap: 16,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: AppColors.muted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: AppColors.primary,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: AppColors.textSecondary,
  },
  cardGap: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  dangerText: {
    color: AppColors.textPrimary,
  },
  comingSoonText: {
    fontSize: 13,
    color: AppColors.textSecondary,
    fontStyle: 'italic',
  },
});

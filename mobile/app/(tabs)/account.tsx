import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Buffer } from 'buffer';
import { File } from 'expo-file-system';
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
import * as Sharing from 'expo-sharing';
import type { Expense } from '@/types/database';


const AccountScreen = () => {
  const { profile, upsertBudget, signOut, user, session } = useAuth();
  const insets = useSafeAreaInsets();
  const [budget, setBudget] = useState(String(profile?.monthly_budget ?? ''));
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);

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
    // @ts-ignore: cacheDirectory is available at runtime
    const uri = `${(FileSystem as any).cacheDirectory}flow-export.csv`;
    await FileSystem.writeAsStringAsync(uri, csv, { encoding: 'utf8' });
    await Sharing.shareAsync(uri, { mimeType: 'text/csv', dialogTitle: 'Flow export' });
  };

  const onDeleteAccount = async () => {
  if (!user) return;

  Alert.alert(
    'Delete account',
    'This will permanently delete your account and all data. This cannot be undone.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setDeleting(true);

            // Get session token
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !sessionData.session) {
              throw new Error('Not authenticated');
            }

            const accessToken = sessionData.session.access_token;

            // Call Edge Function (secure deletion)
            const response = await fetch(
              'https://qbvjzqdcyqzugtqreqau.supabase.co/functions/v1/auth-remover',
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                },
              }
            );

            const result = await response.json();

            if (!response.ok || result.error) {
              throw new Error(result.error || 'Account deletion failed');
            }

            // Sign out locally after deletion
            await signOut();

            Alert.alert('Account deleted', 'Your account has been permanently removed.');

          } catch (err: any) {
            Alert.alert('Error', err.message || 'Failed to delete account.');
          } finally {
            setDeleting(false);
          }
        },
      },
    ]
  );
};


  // --- Bank Statement Upload Logic (PDF) ---
  const onUploadStatement = async () => {
    if (!user) return;
    setUploading(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
      if (result.canceled || !result.assets?.[0]?.uri) {
        setUploading(false);
        return;
      }
      const fileUri = result.assets[0].uri;
      // Read as binary and upload to backend
      // Read file as base64 and convert to Uint8Array for Blob
      const base64 = await FileSystem.readAsStringAsync(fileUri, { encoding: 'base64' });
      const byteArray = Uint8Array.from(Buffer.from(base64, 'base64'));
      const formData = new FormData();
      formData.append('file', new Blob([byteArray], { type: 'application/pdf' }), 'statement.pdf');
      const response = await fetch('http://localhost:8000/parse-statement', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to parse PDF');
      const transactions = await response.json();
      if (!Array.isArray(transactions) || transactions.length === 0) throw new Error('No valid expenses found in file.');
      const payload = transactions.map((t: any) => ({
        user_id: user.id,
        amount: t.amount,
        category: t.category || 'Imported',
        merchant: t.merchant || null,
        date: t.date,
      }));
      for (let i = 0; i < payload.length; i += 500) {
        const batch = payload.slice(i, i + 500);
        const { error } = await supabase.from('expenses').insert(batch);
        if (error) throw error;
      }
      Alert.alert('Success', 'Bank statement imported successfully.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to import bank statement.');
    } finally {
      setUploading(false);
    }
  };

  // --- UI ---
  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}> 
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
              {saving ? 'Saving…' : 'Change Budget'}
            </Button>
          </CardContent>
        </Card>

        {/* Bank Statement Card */}
        <Card variant="default">
          <CardHeader>
            <Text style={styles.sectionTitle}>🏦 Bank Statement</Text>
          </CardHeader>
          <CardContent style={styles.cardGap}>
            <Button
              variant="primary"
              size="md"
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onUploadStatement();
              }}
              disabled={uploading}
            >
              {uploading ? 'Uploading…' : 'Upload Statement'}
            </Button>
            <Text style={styles.comingSoonText}>Upload a PDF bank statement</Text>
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
      </ScrollView>
    </View>
  );
};

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
    color: AppColors.primaryForeground,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: AppColors.textPrimary,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: AppColors.textSecondary,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  cardGap: {
    gap: 12,
  },
  comingSoonText: {
    fontSize: 12,
    color: AppColors.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default AccountScreen;

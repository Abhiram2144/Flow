import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { AppColors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useAddExpense } from '@/hooks/use-expenses';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Input,
  Alert as AlertComponent,
} from '@/components/ui';

const categories = ['Essentials', 'Food', 'Transport', 'Home', 'Fun', 'Other'];

const categoryEmojis: Record<string, string> = {
  Essentials: '🛒',
  Food: '🍽️',
  Transport: '🚗',
  Home: '🏠',
  Fun: '🎉',
  Other: '📌',
};

export default function AddExpenseScreen() {
    const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const router = useRouter();
  const addExpense = useAddExpense(user?.id ?? null);

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [merchant, setMerchant] = useState('');
  const [errors, setErrors] = useState<{ amount?: string; date?: string; submit?: string }>({});

  const onSave = async () => {
    if (!user) {
      Alert.alert('Please log in again');
      return;
    }

    const value = Number(amount);
    const nextErrors: { amount?: string; date?: string; submit?: string } = {};

    if (!value || value <= 0) {
      nextErrors.amount = 'Enter a positive amount to continue.';
    }

    if (!date.trim()) {
      nextErrors.date = 'Enter a date (YYYY-MM-DD).';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});

    try {
      await addExpense.mutateAsync({ amount: value, category, merchant, date });
      router.replace('/(tabs)');
    } catch (err) {
      setErrors({ submit: (err as Error).message });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}> 
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: 'padding', android: undefined })}>
        <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Add Expense</Text>
          <Text style={styles.subtitle}>Track your spending</Text>
        </View>

        {/* Amount Card */}
        <Card variant="elevated">
          <CardContent>
            <Text style={styles.amountLabel}>Amount</Text>
            <View style={styles.amountInputWrapper}>
              <Text style={styles.currencyPrefix}>£</Text>
              <View style={styles.flex}>
                <Input
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  placeholder="0.00"
                  containerStyle={styles.inputContainer}
                  style={styles.amountTextInput}
                />
              </View>
            </View>
            {errors.amount && (
              <AlertComponent variant="error" message={errors.amount} />
            )}
          </CardContent>
        </Card>

        {/* Category Card */}
        <Card variant="default">
          <CardHeader>
            <Text style={styles.sectionTitle}>Category</Text>
          </CardHeader>
          <CardContent>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryScrollContent}
              style={styles.categoryScroll}
            >
              {categories.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => {
                    setCategory(c);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={[
                    styles.categoryChip,
                    category === c && styles.categoryChipActive,
                  ]}
                >
                  <Text style={styles.categoryEmoji}>
                    {categoryEmojis[c]}
                  </Text>
                  <Text
                    style={[
                      styles.categoryText,
                      category === c && styles.categoryTextActive,
                    ]}
                  >
                    {c}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </CardContent>
        </Card>

        {/* Date Card */}
        <Card variant="default">
          <CardHeader>
            <Text style={styles.sectionTitle}>Date</Text>
          </CardHeader>
          <CardContent>
            <Input
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
            />
            {errors.date && (
              <AlertComponent variant="error" message={errors.date} />
            )}
          </CardContent>
        </Card>

        {/* Merchant Card */}
        <Card variant="default">
          <CardHeader>
            <Text style={styles.sectionTitle}>Merchant</Text>
          </CardHeader>
          <CardContent>
            <Input
              value={merchant}
              onChangeText={setMerchant}
              placeholder="e.g., Coffee shop, Grocery store"
            />
          </CardContent>
        </Card>

        {/* Submit Errors */}
        {errors.submit && (
          <AlertComponent
            variant="error"
            title="Could not save"
            message={errors.submit}
          />
        )}

        {/* Save Button */}
        <Button
          variant="primary"
          size="lg"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onSave();
          }}
          disabled={addExpense.isPending}
          style={styles.submitButton}
        >
          {addExpense.isPending ? '💾 Saving...' : '✅ Save Expense'}
        </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
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
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: AppColors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: AppColors.textSecondary,
  },
  amountLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currencyPrefix: {
    fontSize: 36,
    fontWeight: '700',
    color: AppColors.primary,
  },
  flex: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 0,
  },
  amountTextInput: {
    fontSize: 36,
    fontWeight: '700',
    color: AppColors.accent,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.textPrimary,
  },
  categoryScroll: {
    marginHorizontal: -16, // pull out to edge of card content
  },
  categoryScrollContent: {
    paddingHorizontal: 16, // add internal padding
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryChip: {
    backgroundColor: AppColors.card,
    borderWidth: 1.5,
    borderColor: AppColors.border,
    borderRadius: 20, // more rounded
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row', // make horizontal
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: AppColors.primary,
    borderColor: AppColors.primary,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: AppColors.textPrimary,
    textAlign: 'center',
  },
  categoryTextActive: {
    color: AppColors.primaryForeground,
    fontWeight: '700',
  },
  submitButton: {
    marginTop: 12,
  },
});

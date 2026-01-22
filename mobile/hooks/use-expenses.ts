import { endOfMonth, format, startOfMonth } from 'date-fns';
import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { Expense } from '@/types/database';
import type { Database } from '@/types/database';

const monthRange = (now = new Date()) => {
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
  };
};

type Totals = {
  total: number;
  byCategory: Record<string, number>;
  byDate: Record<string, number>;
};

async function fetchMonthlyExpenses(userId: string): Promise<Expense[]> {
  const { start, end } = monthRange();
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('user_id', userId)
    .gte('date', start)
    .lte('date', end)
    .order('date', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export function useMonthlyExpenses(userId: string | null) {
  const query = useQuery<Expense[]>({
    queryKey: ['expenses', 'monthly', userId],
    queryFn: () => fetchMonthlyExpenses(userId as string),
    enabled: Boolean(userId),
  });

  const totals = useMemo<Totals>(() => {
    if (!query.data) return { total: 0, byCategory: {}, byDate: {} };
    const byCategory: Record<string, number> = {};
    const byDate: Record<string, number> = {};
    const total = query.data.reduce((acc, expense) => {
      const dayKey = expense.date;
      byCategory[expense.category] = (byCategory[expense.category] ?? 0) + expense.amount;
      byDate[dayKey] = (byDate[dayKey] ?? 0) + expense.amount;
      return acc + expense.amount;
    }, 0);
    return { total, byCategory, byDate };
  }, [query.data]);

  return { ...query, totals };
}

async function insertExpense(expense: Database['public']['Tables']['expenses']['Insert']) {
  const { error } = await supabase.from('expenses').insert(expense);
  if (error) throw new Error(error.message);
}

export function useAddExpense(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { amount: number; category: string; merchant?: string; date: string }) =>
      insertExpense({ ...payload, user_id: userId as string }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', 'monthly', userId] });
    },
  });
}

export function useRecentExpenses(userId: string | null, limit = 5) {
  return useQuery<Expense[]>({
    queryKey: ['expenses', 'recent', userId, limit],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId as string)
        .order('date', { ascending: false })
        .limit(limit);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
  });
}

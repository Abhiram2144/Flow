import { getDaysInMonth, getDaysElapsed } from './date';

export interface Expense {
  amount: number;
  date: string;
  category?: string;
  merchant?: string;
}

/**
 * Calculate the total amount spent from an array of expenses
 */
export function getTotalSpent(expenses: Expense[]): number {
  if (!expenses || expenses.length === 0) return 0;
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

/**
 * Calculate the average daily spend based on days elapsed
 * Returns 0 if daysElapsed is 0 to avoid division by zero
 */
export function getAverageDailySpend(expenses: Expense[], daysElapsed: number): number {
  if (daysElapsed === 0) return 0;
  const totalSpent = getTotalSpent(expenses);
  return totalSpent / daysElapsed;
}

/**
 * Calculate how much should ideally be spent by today based on budget
 */
export function getIdealSpendByToday(
  monthlyBudget: number,
  daysElapsed: number,
  daysInMonth: number
): number {
  if (daysInMonth === 0) return 0;
  return (monthlyBudget / daysInMonth) * daysElapsed;
}

/**
 * Calculate remaining budget
 * Returns 0 if result would be negative (overspent)
 */
export function getRemainingBudget(monthlyBudget: number, totalSpent: number): number {
  const remaining = monthlyBudget - totalSpent;
  return Math.max(0, remaining);
}

/**
 * Round currency to 2 decimal places
 */
export function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}

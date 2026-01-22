import { getAverageDailySpend, getTotalSpent, roundCurrency } from './spending';
import { getDaysInMonth, getDaysElapsed } from './date';
import type { Expense } from './spending';

export type ProjectionStatus = 'UNDER' | 'OVER';

export interface SpendProjection {
  projectedSpend: number;
  status: ProjectionStatus;
  deltaFromBudget: number;
  message: string;
}

/**
 * Project end-of-month spending based on current pace
 * Non-ML linear projection using average daily spend
 */
export function getProjectedMonthEndSpend(
  expenses: Expense[],
  monthlyBudget: number,
  date: Date = new Date()
): SpendProjection {
  const daysElapsed = getDaysElapsed(date);
  const daysInMonth = getDaysInMonth(date);

  // Edge case: No data yet
  if (daysElapsed === 0 || expenses.length === 0) {
    return {
      projectedSpend: 0,
      status: 'UNDER',
      deltaFromBudget: monthlyBudget,
      message: "At this pace, you'll stay under budget",
    };
  }

  const avgDailySpend = getAverageDailySpend(expenses, daysElapsed);
  const projectedSpend = roundCurrency(avgDailySpend * daysInMonth);
  const deltaFromBudget = roundCurrency(monthlyBudget - projectedSpend);

  const status: ProjectionStatus = projectedSpend <= monthlyBudget ? 'UNDER' : 'OVER';
  const message =
    status === 'UNDER'
      ? "At this pace, you'll stay under budget"
      : "At this pace, you may exceed your budget";

  return {
    projectedSpend,
    status,
    deltaFromBudget,
    message,
  };
}

export interface WeeklyBreakdown {
  week: string;
  weekNumber: number;
  total: number;
}

/**
 * Group expenses by week (Week 1, Week 2, etc.)
 * Week boundaries: Days 1-7, 8-14, 15-21, 22-end
 */
export function groupExpensesByWeek(expenses: Expense[], referenceDate: Date = new Date()): WeeklyBreakdown[] {
  if (!expenses || expenses.length === 0) return [];

  const weeks: { [key: number]: number } = {};

  expenses.forEach((expense) => {
    const expenseDate = new Date(expense.date);
    const dayOfMonth = expenseDate.getDate();
    const weekNumber = Math.ceil(dayOfMonth / 7);

    weeks[weekNumber] = (weeks[weekNumber] || 0) + expense.amount;
  });

  return Object.entries(weeks)
    .map(([week, total]) => ({
      week: `Week ${week}`,
      weekNumber: parseInt(week),
      total: roundCurrency(total),
    }))
    .sort((a, b) => a.weekNumber - b.weekNumber);
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  percentage: number;
}

/**
 * Group expenses by category and calculate percentages
 */
export function groupExpensesByCategory(expenses: Expense[]): CategoryBreakdown[] {
  if (!expenses || expenses.length === 0) return [];

  const categories: { [key: string]: number } = {};
  const totalSpent = getTotalSpent(expenses);

  expenses.forEach((expense) => {
    const category = expense.category || 'Other';
    categories[category] = (categories[category] || 0) + expense.amount;
  });

  return Object.entries(categories)
    .map(([category, total]) => ({
      category,
      total: roundCurrency(total),
      percentage: roundCurrency((total / totalSpent) * 100),
    }))
    .sort((a, b) => b.total - a.total);
}

export interface DailyBreakdown {
  day: number;
  date: string;
  total: number;
}

/**
 * Group expenses by day of month for daily trend analysis
 */
export function groupExpensesByDay(expenses: Expense[], referenceDate: Date = new Date()): DailyBreakdown[] {
  if (!expenses || expenses.length === 0) return [];

  const days: { [key: number]: { total: number; date: string } } = {};

  expenses.forEach((expense) => {
    const expenseDate = new Date(expense.date);
    const dayOfMonth = expenseDate.getDate();

    if (!days[dayOfMonth]) {
      days[dayOfMonth] = {
        total: 0,
        date: expense.date,
      };
    }

    days[dayOfMonth].total += expense.amount;
  });

  return Object.entries(days)
    .map(([day, data]) => ({
      day: parseInt(day),
      date: data.date,
      total: roundCurrency(data.total),
    }))
    .sort((a, b) => a.day - b.day);
}

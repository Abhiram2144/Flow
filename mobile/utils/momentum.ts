import { getDaysInMonth, getDaysElapsed } from './date';
import { getTotalSpent, getIdealSpendByToday, roundCurrency } from './spending';
import type { Expense } from './spending';
import { AppColors } from '@/constants/theme';

export type MomentumStatus = 'SAFE' | 'BALANCED' | 'RISK';

export type Momentum = {
  ratio: number;
  status: MomentumStatus;
  message: string;
  color: string;
  actualSpend: number;
  idealSpend: number;
};

/**
 * Calculate spending momentum based on budget and expenses
 * Returns a deterministic momentum calculation with status, message, and color
 */
export function getMomentum(
  monthlyBudget: number,
  expenses: Expense[],
  date: Date = new Date()
): Momentum {
  // Edge case: No budget set
  if (!monthlyBudget || monthlyBudget <= 0) {
    return {
      ratio: 0,
      status: 'SAFE',
      message: 'Set a budget to start tracking your flow.',
      color: AppColors.textTertiary,
      actualSpend: 0,
      idealSpend: 0,
    };
  }

  const daysInMonth = getDaysInMonth(date);
  const daysElapsed = getDaysElapsed(date);

  // Edge case: First day of month, no data yet
  if (daysElapsed === 0) {
    return {
      ratio: 0,
      status: 'SAFE',
      message: 'Your month is just starting.',
      color: AppColors.primary,
      actualSpend: 0,
      idealSpend: 0,
    };
  }

  const actualSpend = roundCurrency(getTotalSpent(expenses));
  const idealSpend = roundCurrency(getIdealSpendByToday(monthlyBudget, daysElapsed, daysInMonth));

  // Edge case: No expenses yet
  if (actualSpend === 0) {
    return {
      ratio: 0,
      status: 'SAFE',
      message: "You're spending slower than your ideal pace",
      color: AppColors.primary,
      actualSpend: 0,
      idealSpend,
    };
  }

  // Calculate momentum ratio
  const ratio = idealSpend === 0 ? 0 : actualSpend / idealSpend;

  // Determine status and messaging
  if (ratio < 0.9) {
    return {
      ratio: roundCurrency(ratio),
      status: 'SAFE',
      message: "You're spending slower than your ideal pace",
      color: AppColors.primary,
      actualSpend,
      idealSpend,
    };
  }

  if (ratio <= 1.1) {
    return {
      ratio: roundCurrency(ratio),
      status: 'BALANCED',
      message: "You're right on track this month",
      color: AppColors.accent,
      actualSpend,
      idealSpend,
    };
  }

  return {
    ratio: roundCurrency(ratio),
    status: 'RISK',
    message: "You're spending faster than planned",
    color: AppColors.destructive,
    actualSpend,
    idealSpend,
  };
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use getMomentum instead
 */
export function calculateMomentum(monthlyBudget: number, spent: number, now = new Date()): Omit<Momentum, 'color' | 'actualSpend' | 'idealSpend'> {
  const expenses: Expense[] = [{ amount: spent, date: now.toISOString() }];
  const momentum = getMomentum(monthlyBudget, expenses, now);
  
  return {
    ratio: momentum.ratio,
    status: momentum.status,
    message: momentum.message.replace('ideal pace', 'budget. Keep a steady rhythm')
      .replace('right on track', 'on track. Stay mindful for the rest of the month')
      .replace('faster than planned', 'running hot. Consider pausing non-essentials'),
  };
}

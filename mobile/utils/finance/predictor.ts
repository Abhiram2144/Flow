// Feature engineering and ML-lite model logic for local spending prediction
// All logic is deterministic, local, and explainable

import {
  getTotalSpent,
  getAverageDailySpend,
  groupExpensesByDay,
  groupExpensesByWeek,
  groupExpensesByCategory,
  getMomentum,
  getProjectedMonthEndSpend,
  roundCurrency,
  type Expense,
} from '../index';

// --- Feature Engineering ---

export function computeAvgDailySpend(expenses: Expense[], daysElapsed: number): number {
  return getAverageDailySpend(expenses, daysElapsed);
}

export function computeLastNDaysSpend(expenses: Expense[], n: number, today: Date = new Date()): number {
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - n + 1);
  return expenses
    .filter(e => new Date(e.date) >= cutoff && new Date(e.date) <= today)
    .reduce((sum, e) => sum + e.amount, 0);
}

export function computeDailySpendSeries(expenses: Expense[], days: number, today: Date = new Date()): number[] {
  const series: number[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(day.getDate() - i);
    const total = expenses
      .filter(e => new Date(e.date).toDateString() === day.toDateString())
      .reduce((sum, e) => sum + e.amount, 0);
    series.push(total);
  }
  return series;
}

export function computeSpendTrendSlope(dailySeries: number[]): number {
  // Simple linear regression slope (least squares)
  const n = dailySeries.length;
  if (n < 2) return 0;
  const xMean = (n - 1) / 2;
  const yMean = dailySeries.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - xMean) * (dailySeries[i] - yMean);
    den += (i - xMean) ** 2;
  }
  return den === 0 ? 0 : num / den;
}

export function computeSpendVelocity(dailySeries: number[]): number {
  // Rate of change: last value - first value
  if (dailySeries.length < 2) return 0;
  return dailySeries[dailySeries.length - 1] - dailySeries[0];
}

export function computeMomentum(expenses: Expense[], monthlyBudget: number, today: Date = new Date()) {
  return getMomentum(monthlyBudget, expenses, today);
}

export function computeSpendVariance(dailySeries: number[]): number {
  const n = dailySeries.length;
  if (n === 0) return 0;
  const mean = dailySeries.reduce((a, b) => a + b, 0) / n;
  return dailySeries.reduce((sum, v) => sum + (v - mean) ** 2, 0) / n;
}

export function computeWeekendRatio(expenses: Expense[]): number {
  let weekend = 0, total = 0;
  expenses.forEach(e => {
    const d = new Date(e.date).getDay();
    if (d === 0 || d === 6) weekend += e.amount;
    total += e.amount;
  });
  return total === 0 ? 0 : weekend / total;
}

import type { CategoryBreakdown } from '../projections';
export function computeCategoryRatios(expenses: Expense[]): Record<string, number> {
  const byCategory: CategoryBreakdown[] = groupExpensesByCategory(expenses);
  const total = byCategory.reduce((sum: number, c: CategoryBreakdown) => sum + c.total, 0);
  const ratios: Record<string, number> = {};
  byCategory.forEach((c: CategoryBreakdown) => {
    ratios[c.category] = total === 0 ? 0 : c.total / total;
  });
  return ratios;
}

// --- Model Training & Prediction ---

export interface TrainedModel {
  slope: number;
  intercept: number;
  variance: number;
  lastTrained: string;
  features: Record<string, any>;
}

export function trainSpendingModel(expenses: Expense[], days: number, today: Date = new Date()): TrainedModel {
  const dailySeries = computeDailySpendSeries(expenses, days, today);
  const slope = computeSpendTrendSlope(dailySeries);
  const intercept = dailySeries.length > 0 ? dailySeries[0] : 0;
  const variance = computeSpendVariance(dailySeries);
  return {
    slope,
    intercept,
    variance,
    lastTrained: today.toISOString(),
    features: {
      avgDailySpend: computeAvgDailySpend(expenses, days),
      last7DaysSpend: computeLastNDaysSpend(expenses, 7, today),
      last14DaysSpend: computeLastNDaysSpend(expenses, 14, today),
      dailySpendSeries: dailySeries,
      spendTrendSlope: slope,
      spendVelocity: computeSpendVelocity(dailySeries),
      momentum: computeMomentum(expenses, 0, today),
      spendVariance: variance,
      weekendRatio: computeWeekendRatio(expenses),
      categoryRatios: computeCategoryRatios(expenses),
    },
  };
}

export function predictDailySpend(model: TrainedModel, dayOffset: number): number {
  // Linear regression: y = slope * x + intercept
  return roundCurrency(model.slope * dayOffset + model.intercept);
}

export function predictNextNDays(model: TrainedModel, n: number): number {
  let total = 0;
  for (let i = 0; i < n; i++) {
    total += predictDailySpend(model, i);
  }
  return roundCurrency(total);
}

export function predictMonthEnd(model: TrainedModel, daysLeft: number): number {
  return predictNextNDays(model, daysLeft);
}

// --- Budget Risk Logic ---

export function getBudgetRiskStatus(projectedMonthEnd: number, budget: number): { status: 'SAFE' | 'RISK' | 'OVER_BUDGET', riskScore: number } {
  if (projectedMonthEnd > budget) return { status: 'OVER_BUDGET', riskScore: 1 };
  if (projectedMonthEnd > 0.9 * budget) return { status: 'RISK', riskScore: 0.7 };
  return { status: 'SAFE', riskScore: 0.2 };
}

// --- Explanation Engine ---

export function generateExplanations(model: TrainedModel, budget: number, projectedMonthEnd: number): string[] {
  const exp: string[] = [];
  if (model.slope > 0.5) exp.push('Daily spending is increasing week over week.');
  if (model.features.momentum.ratio > 1.1) exp.push('Momentum is above safe range.');
  if (model.features.weekendRatio > 0.4) exp.push('Weekend spending is consistently higher.');
  if (model.variance > 20) exp.push('Spending variance is increasing.');
  if (projectedMonthEnd > budget) exp.push('Projected to exceed your budget this month.');
  if (exp.length === 0) exp.push('Spending is steady and within a healthy range.');
  return exp;
}

// --- Prediction Output Format ---

export interface PredictionResult {
  next7Days: number;
  next14Days: number;
  monthEnd: number;
  status: 'SAFE' | 'RISK' | 'OVER_BUDGET';
  riskScore: number;
  confidence: number;
  explanation: string[];
}

export function runSpendingPrediction(
  expenses: Expense[],
  budget: number,
  today: Date = new Date(),
  daysInMonth: number = 30
): PredictionResult {
  const daysElapsed = expenses.length > 0 ? Math.max(...expenses.map(e => new Date(e.date).getDate())) : today.getDate();
  const daysLeft = daysInMonth - daysElapsed;
  const model = trainSpendingModel(expenses, daysElapsed, today);
  const next7Days = predictNextNDays(model, 7);
  const next14Days = predictNextNDays(model, 14);
  const monthEnd = predictMonthEnd(model, daysLeft);
  const { status, riskScore } = getBudgetRiskStatus(monthEnd, budget);
  const confidence = Math.max(0.5, 1 - model.variance / 100); // crude confidence
  const explanation = generateExplanations(model, budget, monthEnd);
  return {
    next7Days,
    next14Days,
    monthEnd,
    status,
    riskScore,
    confidence: roundCurrency(confidence),
    explanation,
  };
}

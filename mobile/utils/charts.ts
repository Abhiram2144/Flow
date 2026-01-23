import { getDaysInMonth, getDaysElapsed, getMonthStart } from './date';
import { getIdealSpendByToday, getTotalSpent, roundCurrency } from './spending';
import { groupExpensesByDay } from './projections';
import type { Expense } from './spending';
import { AppColors } from '@/constants/theme';

export interface LineChartDataPoint {
  day: number;
  actualCumulative: number;
  idealCumulative: number;
}

/**
 * Prepare data for line chart showing actual vs ideal cumulative spend
 * X-axis: Day of month (1-31)
 * Y-axis: Cumulative spending
 */
export function prepareLineChartData(
  expenses: Expense[],
  monthlyBudget: number,
  date: Date = new Date()
): LineChartDataPoint[] {
  const daysInMonth = getDaysInMonth(date);
  const daysElapsed = getDaysElapsed(date);
  const dailyExpenses = groupExpensesByDay(expenses, date);

  const data: LineChartDataPoint[] = [];
  let cumulativeActual = 0;
  const dailyIdealSpend = monthlyBudget / daysInMonth;

  // Create a map for quick lookup
  const dailyTotals = new Map(dailyExpenses.map((d) => [d.day, d.total]));

  // Generate data points for each day up to today
  for (let day = 1; day <= daysElapsed; day++) {
    const dayTotal = dailyTotals.get(day) || 0;
    cumulativeActual += dayTotal;

    data.push({
      day,
      actualCumulative: roundCurrency(cumulativeActual),
      idealCumulative: roundCurrency(dailyIdealSpend * day),
    });
  }

  return data;
}

export interface PieChartDataPoint {
  category: string;
  value: number;
  percentage: number;
  color: string;
}

/**
 * Prepare data for pie chart showing category breakdown
 */
export function preparePieChartData(expenses: Expense[]): PieChartDataPoint[] {
  if (!expenses || expenses.length === 0) return [];

  const categories: { [key: string]: number } = {};
  const totalSpent = getTotalSpent(expenses);

  expenses.forEach((expense) => {
    const category = expense.category || 'Other';
    categories[category] = (categories[category] || 0) + expense.amount;
  });

  // Predefined category colors using AppColors
  const categoryColors: { [key: string]: string } = {
    Food: AppColors.chart1,
    Transport: AppColors.chart2,
    Entertainment: AppColors.chart3,
    Shopping: AppColors.chart4,
    Bills: AppColors.chart5,
    Healthcare: AppColors.destructive,
    Other: AppColors.muted,
  };

  return Object.entries(categories)
    .map(([category, value]) => ({
      category,
      value: roundCurrency(value),
      percentage: roundCurrency((value / totalSpent) * 100),
      color: categoryColors[category] || '#6B7280',
    }))
    .sort((a, b) => b.value - a.value);
}

export interface BarChartDataPoint {
  label: string;
  value: number;
}

/**
 * Prepare data for bar chart showing weekly spending
 */
export function prepareBarChartData(expenses: Expense[], date: Date = new Date()): BarChartDataPoint[] {
  if (!expenses || expenses.length === 0) return [];

  const weeks: { [key: number]: number } = {};

  expenses.forEach((expense) => {
    const expenseDate = new Date(expense.date);
    const dayOfMonth = expenseDate.getDate();
    const weekNumber = Math.ceil(dayOfMonth / 7);

    weeks[weekNumber] = (weeks[weekNumber] || 0) + expense.amount;
  });

  return Object.entries(weeks)
    .map(([week, value]) => ({
      label: `W${week}`,
      value: roundCurrency(value),
    }))
    .sort((a, b) => parseInt(a.label.substring(1)) - parseInt(b.label.substring(1)));
}

/**
 * Prepare data for momentum chart showing daily spending trend
 * Returns simplified data structure for SVG rendering
 */
export interface MomentumChartDataPoint {
  day: number;
  amount: number;
  x: number;
  y: number;
}

export interface MomentumChartData {
  points: MomentumChartDataPoint[];
  maxAmount: number;
  dailyData: Array<{ day: number; amount: number }>;
}

export function prepareMomentumChartData(
  expenses: Expense[],
  budgetStartDate: Date,
  chartWidth: number,
  chartHeight: number,
  padding: { top: number; right: number; bottom: number; left: number }
): MomentumChartData {
  if (!expenses || expenses.length === 0) {
    return {
      points: [],
      maxAmount: 0,
      dailyData: [],
    };
  }

  // Group by days since budget start
  const days: { [key: number]: number } = {};

  expenses.forEach((expense) => {
    const expenseDate = new Date(expense.date);
    const daysSinceStart = Math.floor((expenseDate.getTime() - budgetStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    if (daysSinceStart > 0) {
      days[daysSinceStart] = (days[daysSinceStart] || 0) + expense.amount;
    }
  });

  const dailyData = Object.entries(days)
    .map(([day, amount]) => ({
      day: parseInt(day),
      amount: roundCurrency(amount),
    }))
    .sort((a, b) => a.day - b.day);

  const maxAmount = Math.max(...dailyData.map((d) => d.amount), 0);
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  const ySteps = 5;
  const yStepValue = Math.ceil(maxAmount / ySteps);

  // Generate points with coordinates
  const points = dailyData.map((day, index) => {
    const x = padding.left + (index / (dailyData.length - 1 || 1)) * plotWidth;
    const y = padding.top + plotHeight - (day.amount / (yStepValue * ySteps)) * plotHeight;

    return {
      day: day.day,
      amount: day.amount,
      x: roundCurrency(x),
      y: roundCurrency(y),
    };
  });

  return {
    points,
    maxAmount,
    dailyData,
  };
}

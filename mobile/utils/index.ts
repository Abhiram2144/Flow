/**
 * Flow MVP Calculations & Display Logic
 * 
 * This module exports all utility functions for spending calculations,
 * projections, and chart data preparation.
 * 
 * Design Principles:
 * - Deterministic calculations (no ML)
 * - Client-safe operations
 * - Edge case handling (no negative values, division by zero)
 * - Currency rounded to 2 decimals
 * - Calm, supportive messaging (no guilt or alarms)
 */

// Date utilities
export {
  getDaysInMonth,
  getDaysElapsed,
  getMonthStart,
  getMonthEnd,
} from './date';

// Core spending metrics
export {
  getTotalSpent,
  getAverageDailySpend,
  getIdealSpendByToday,
  getRemainingBudget,
  roundCurrency,
  type Expense,
} from './spending';

// Momentum calculations
export {
  getMomentum,
  calculateMomentum,
  type Momentum,
  type MomentumStatus,
} from './momentum';

// Projections and grouping
export {
  getProjectedMonthEndSpend,
  groupExpensesByWeek,
  groupExpensesByCategory,
  groupExpensesByDay,
  type SpendProjection,
  type ProjectionStatus,
  type WeeklyBreakdown,
  type CategoryBreakdown,
  type DailyBreakdown,
} from './projections';

// Chart data preparation
export {
  prepareLineChartData,
  preparePieChartData,
  prepareBarChartData,
  prepareMomentumChartData,
  type LineChartDataPoint,
  type PieChartDataPoint,
  type BarChartDataPoint,
  type MomentumChartDataPoint,
  type MomentumChartData,
} from './charts';

// ML-lite finance predictor
export * from './finance';

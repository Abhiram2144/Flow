# Flow MVP Calculations & Display Logic

## Overview

This directory contains all spending calculations and insights for the Flow MVP. These calculations are:
- **Deterministic**: No machine learning, consistent results
- **Client-safe**: No Supabase calls, runs entirely on device
- **Edge-case hardened**: Handles division by zero, negative values, empty data
- **Currency-precise**: All amounts rounded to 2 decimals
- **User-friendly**: Calm, supportive messaging with no guilt or alarms

---

## File Structure

```
utils/
├── index.ts           # Main export file
├── date.ts            # Date and time calculations
├── spending.ts        # Core spending metrics
├── momentum.ts        # Spending momentum analysis
├── projections.ts     # Future spend projections & grouping
└── charts.ts          # Chart data preparation
```

---

## 1. Date Utilities (`date.ts`)

### `getDaysInMonth(date?: Date): number`
Returns the total number of days in the month.

```typescript
getDaysInMonth(new Date('2024-02-15')); // 29 (leap year)
getDaysInMonth(new Date('2024-01-15')); // 31
```

### `getDaysElapsed(date?: Date): number`
Returns how many days have passed in the current month (1-based, inclusive).

```typescript
// On Jan 5th:
getDaysElapsed(new Date('2024-01-05')); // 5

// On Jan 1st:
getDaysElapsed(new Date('2024-01-01')); // 1
```

### `getMonthStart(date?: Date): Date`
Returns the first day of the month.

### `getMonthEnd(date?: Date): Date`
Returns the last day of the month.

---

## 2. Core Spending Metrics (`spending.ts`)

### `getTotalSpent(expenses: Expense[]): number`
Sums all expense amounts.

```typescript
getTotalSpent([
  { amount: 50, date: '2024-01-05' },
  { amount: 30, date: '2024-01-10' }
]); // 80
```

### `getAverageDailySpend(expenses: Expense[], daysElapsed: number): number`
Calculates average spending per day.

```typescript
const expenses = [{ amount: 100, date: '2024-01-05' }];
getAverageDailySpend(expenses, 5); // 20
```

**Edge case**: Returns 0 if `daysElapsed === 0`.

### `getIdealSpendByToday(monthlyBudget: number, daysElapsed: number, daysInMonth: number): number`
Calculates how much you should have ideally spent by today.

```typescript
// Budget: £1000, Day 10 of 31-day month
getIdealSpendByToday(1000, 10, 31); // 322.58
```

### `getRemainingBudget(monthlyBudget: number, totalSpent: number): number`
Returns remaining budget (clamped to 0 if overspent).

```typescript
getRemainingBudget(1000, 600); // 400
getRemainingBudget(1000, 1200); // 0
```

### `roundCurrency(amount: number): number`
Rounds to 2 decimal places.

---

## 3. Spending Momentum (`momentum.ts`)

### `getMomentum(monthlyBudget: number, expenses: Expense[], date?: Date): Momentum`

**Core feature** that calculates spending momentum relative to ideal pace.

#### Returns:
```typescript
{
  ratio: number;           // actualSpend / idealSpend
  status: 'SAFE' | 'BALANCED' | 'RISK';
  message: string;         // User-friendly message
  color: string;           // Status color (green/yellow/red)
  actualSpend: number;     // Total spent so far
  idealSpend: number;      // What you should have spent by today
}
```

#### Status Thresholds:
- **SAFE** (`ratio < 0.9`): Spending slower than ideal
- **BALANCED** (`0.9 ≤ ratio ≤ 1.1`): On track
- **RISK** (`ratio > 1.1`): Spending faster than planned

#### Examples:

```typescript
// Spending under budget
getMomentum(1000, [{ amount: 200, date: '2024-01-10' }]);
// { ratio: 0.62, status: 'SAFE', message: "You're spending slower than your ideal pace", ... }

// Spending on track
getMomentum(1000, [{ amount: 320, date: '2024-01-10' }]);
// { ratio: 0.99, status: 'BALANCED', message: "You're right on track this month", ... }

// Spending over pace
getMomentum(1000, [{ amount: 500, date: '2024-01-10' }]);
// { ratio: 1.55, status: 'RISK', message: "You're spending faster than planned", ... }
```

#### Edge Cases:
- No budget set → Returns SAFE with neutral message
- First day of month → Returns SAFE
- No expenses → Returns SAFE with 0 spending

---

## 4. Projections & Grouping (`projections.ts`)

### `getProjectedMonthEndSpend(expenses: Expense[], monthlyBudget: number, date?: Date): SpendProjection`

Projects end-of-month spending using linear extrapolation (no ML).

```typescript
{
  projectedSpend: number;
  status: 'UNDER' | 'OVER';
  deltaFromBudget: number;
  message: string;
}
```

**Formula**: `avgDailySpend * daysInMonth`

```typescript
// Spending £20/day on Day 10 of 31-day month with £1000 budget
getProjectedMonthEndSpend(expenses, 1000);
// { projectedSpend: 620, status: 'UNDER', deltaFromBudget: 380, message: "At this pace, you'll stay under budget" }
```

### `groupExpensesByWeek(expenses: Expense[], referenceDate?: Date): WeeklyBreakdown[]`

Groups expenses into weeks (Days 1-7, 8-14, 15-21, 22-end).

```typescript
[
  { week: 'Week 1', weekNumber: 1, total: 150.00 },
  { week: 'Week 2', weekNumber: 2, total: 200.00 },
  ...
]
```

### `groupExpensesByCategory(expenses: Expense[]): CategoryBreakdown[]`

Groups by category with percentages.

```typescript
[
  { category: 'Food', total: 300, percentage: 50 },
  { category: 'Transport', total: 200, percentage: 33.33 },
  { category: 'Other', total: 100, percentage: 16.67 }
]
```

### `groupExpensesByDay(expenses: Expense[], referenceDate?: Date): DailyBreakdown[]`

Groups by day of month for daily trends.

```typescript
[
  { day: 1, date: '2024-01-01', total: 50 },
  { day: 2, date: '2024-01-02', total: 30 },
  ...
]
```

---

## 5. Chart Data Preparation (`charts.ts`)

### `prepareLineChartData(expenses: Expense[], monthlyBudget: number, date?: Date): LineChartDataPoint[]`

Generates cumulative spending vs ideal spending for line chart.

```typescript
[
  { day: 1, actualCumulative: 50, idealCumulative: 32.26 },
  { day: 2, actualCumulative: 80, idealCumulative: 64.52 },
  ...
]
```

### `preparePieChartData(expenses: Expense[]): PieChartDataPoint[]`

Generates category breakdown for pie chart with colors.

```typescript
[
  { category: 'Food', value: 300, percentage: 50, color: '#10B981' },
  { category: 'Transport', value: 200, percentage: 33.33, color: '#3B82F6' },
  ...
]
```

### `prepareBarChartData(expenses: Expense[], date?: Date): BarChartDataPoint[]`

Generates weekly spending for bar chart.

```typescript
[
  { label: 'W1', value: 150 },
  { label: 'W2', value: 200 },
  ...
]
```

### `prepareMomentumChartData(...): MomentumChartData`

Generates optimized data for the momentum SVG chart with pre-calculated coordinates.

---

## Types

### `Expense`
```typescript
interface Expense {
  amount: number;
  date: string;        // ISO date string
  category?: string;
  merchant?: string;
}
```

All utility functions accept this standard expense shape.

---

## Usage Examples

### Dashboard Screen

```typescript
import { getMomentum, getRemainingBudget, getProjectedMonthEndSpend } from '@/utils';

const momentum = getMomentum(budget, expenses);
const remaining = getRemainingBudget(budget, totalSpent);
const projection = getProjectedMonthEndSpend(expenses, budget);

// Display momentum status
<Text style={{ color: momentum.color }}>
  {momentum.status}
</Text>
<Text>{momentum.message}</Text>

// Display projection
<Text>{projection.message}</Text>
```

### Analytics Screen

```typescript
import { groupExpensesByCategory, preparePieChartData } from '@/utils';

const categories = groupExpensesByCategory(expenses);
const pieData = preparePieChartData(expenses);

// Render pie chart or category list
```

---

## Design Principles

### 1. No Negative Values
All currency calculations return 0 or positive values (no "negative remaining").

### 2. Division by Zero Safety
Functions return 0 or neutral state when denominators are 0.

### 3. Calm Messaging
- ✅ "You're spending slower than your ideal pace"
- ❌ "WARNING: Budget exceeded!"

### 4. Deterministic
Same inputs always produce same outputs (no randomness, no timestamps in logic).

### 5. Explainable
Every calculation can be traced back to simple formulas.

---

## Future V2 Enhancements

The current utilities are designed to be easily upgraded with:
- ML-based projections (replace linear extrapolation)
- Anomaly detection (flag unusual spending patterns)
- Smart categorization (auto-categorize expenses)
- Predictive insights (suggest when to pause spending)

All without breaking existing API contracts.

---

## Testing

```typescript
// Edge case: No expenses
getMomentum(1000, []); 
// { status: 'SAFE', message: "You're spending slower than your ideal pace", ... }

// Edge case: First day
getMomentum(1000, expenses, new Date('2024-01-01'));
// { status: 'SAFE', message: 'Your month is just starting', ... }

// Edge case: No budget
getMomentum(0, expenses);
// { status: 'SAFE', message: 'Set a budget to start tracking your flow.', ... }
```

---

## Performance

All utilities are:
- ⚡ **O(n)** complexity (linear with expenses count)
- 📱 **Client-safe** (no network calls)
- 🔋 **Battery-friendly** (pure calculations, no heavy processing)

Suitable for real-time updates in React components.

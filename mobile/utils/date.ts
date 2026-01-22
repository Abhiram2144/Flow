import { differenceInCalendarDays, endOfMonth, startOfMonth } from 'date-fns';

/**
 * Get the total number of days in the month for a given date
 */
export function getDaysInMonth(date: Date = new Date()): number {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return differenceInCalendarDays(end, start) + 1;
}

/**
 * Get the number of days elapsed in the current month (inclusive of today)
 * Day 1 returns 1, Day 2 returns 2, etc.
 */
export function getDaysElapsed(date: Date = new Date()): number {
  const start = startOfMonth(date);
  return differenceInCalendarDays(date, start) + 1;
}

/**
 * Get the start of the current month
 */
export function getMonthStart(date: Date = new Date()): Date {
  return startOfMonth(date);
}

/**
 * Get the end of the current month
 */
export function getMonthEnd(date: Date = new Date()): Date {
  return endOfMonth(date);
}

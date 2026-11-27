import { DEFAULT_WEEK_START, periodRange, weeksOfMonth, type DateRange, type WeekStart } from './dates';
import type { Transaction } from './types';

export function spentInRange(
  transactions: readonly Transaction[],
  range: DateRange,
  currency: string,
): number {
  let total = 0;
  for (const t of transactions) {
    if (t.deletedAt !== null || t.currency !== currency) continue;
    if (t.occurredAt >= range.start && t.occurredAt < range.end) total += t.amountMinor;
  }
  return total;
}

export function spentToday(transactions: readonly Transaction[], now: number, currency: string): number {
  return spentInRange(transactions, periodRange(now, 'day'), currency);
}

export interface WeekTotal {
  /** 1-based week of the month: W1, W2, … (up to W6) */
  index: number;
  range: DateRange;
  spentMinor: number;
}

/** Spending per week of the current month, for the dashboard chart. */
export function monthWeekTotals(
  transactions: readonly Transaction[],
  now: number,
  currency: string,
  weekStart: WeekStart = DEFAULT_WEEK_START,
): WeekTotal[] {
  return weeksOfMonth(now, weekStart).map((range, i) => ({
    index: i + 1,
    range,
    spentMinor: spentInRange(transactions, range, currency),
  }));
}

export function recentTransactions(transactions: readonly Transaction[], limit: number): Transaction[] {
  return transactions
    .filter((t) => t.deletedAt === null)
    .sort((a, b) => b.occurredAt - a.occurredAt || b.createdAt - a.createdAt)
    .slice(0, limit);
}

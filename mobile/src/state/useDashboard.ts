import { useMemo } from 'react';

import { inRange } from '@/core/dates';
import { monthWeekTotals, recentTransactions, spentToday } from '@/core/summaries';
import { useAppData } from './AppDataProvider';
import { useNow } from './useNow';

export const RECENT_LIMIT = 3;

/** Everything the dashboard shows, derived from stored transactions. */
export function useDashboard() {
  const { transactions, settings } = useAppData();
  const now = useNow();
  const { currency, locale, weekStart } = settings;

  return useMemo(() => {
    const weeks = monthWeekTotals(transactions, now, currency, weekStart);
    return {
      currency,
      locale,
      todayMinor: spentToday(transactions, now, currency),
      weeks,
      currentWeekIndex: Math.max(0, weeks.findIndex((w) => inRange(now, w.range))),
      recent: recentTransactions(transactions, RECENT_LIMIT),
      hasAny: transactions.length > 0,
    };
  }, [transactions, now, currency, locale, weekStart]);
}

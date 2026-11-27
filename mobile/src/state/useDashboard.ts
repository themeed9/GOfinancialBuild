import { useMemo } from 'react';

import { weekTrend } from '@/core/insights';
import { recentTransactions, spentToday } from '@/core/summaries';
import { useAppData } from './AppDataProvider';
import { useNow } from './useNow';

export const RECENT_LIMIT = 3;

/** Everything the home screen shows, derived from stored transactions. */
export function useDashboard() {
  const { transactions, settings } = useAppData();
  const now = useNow();
  const { currency, locale, weekStart } = settings;

  return useMemo(
    () => ({
      now,
      currency,
      locale,
      todayMinor: spentToday(transactions, now, currency),
      trend: weekTrend(transactions, now, currency, weekStart),
      recent: recentTransactions(transactions, RECENT_LIMIT),
    }),
    [transactions, now, currency, locale, weekStart],
  );
}

import { describe, expect, it } from 'vitest';

import { slugify } from '../core/categories';
import { settingsFromDevice } from '../data/defaults';
import { monthWeekTotals, recentTransactions, spentToday } from '../core/summaries';
import { at, tx } from './helpers';

const NOW = at(2026, 11, 18, 15);

describe('summaries', () => {
  it('totals today in the chosen currency only', () => {
    const transactions = [
      tx(328000, at(2026, 11, 18, 8)),
      tx(272005, at(2026, 11, 18, 14)),
      tx(999, at(2026, 11, 17, 23)),
      tx(500, at(2026, 11, 18, 9), { currency: 'USD' }),
      tx(700, at(2026, 11, 18, 10), { deletedAt: NOW }),
    ];
    expect(spentToday(transactions, NOW, 'NGN')).toBe(600005);
  });

  it('returns one total per week of the month, including W5/W6', () => {
    const totals = monthWeekTotals(
      [tx(100, at(2026, 11, 1)), tx(200, at(2026, 11, 10)), tx(300, at(2026, 11, 30))],
      NOW,
      'NGN',
    );
    expect(totals.map((w) => w.index)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(totals.map((w) => w.spentMinor)).toEqual([100, 0, 200, 0, 0, 300]);
  });

  it('lists the newest transactions first and skips deleted ones', () => {
    const a = tx(1, at(2026, 11, 16));
    const b = tx(2, at(2026, 11, 18));
    const c = tx(3, at(2026, 11, 17), { deletedAt: NOW });
    expect(recentTransactions([a, b, c], 3).map((t) => t.amountMinor)).toEqual([2, 1]);
  });

  it('slugifies category names', () => {
    expect(slugify('Food & Dining')).toBe('food-dining');
    expect(slugify('  Bills  /  Utilities ')).toBe('bills-utilities');
  });
});

describe('settingsFromDevice', () => {
  it('uses the phone currency, locale and week start', () => {
    expect(settingsFromDevice({ languageTag: 'en-GH', currencyCode: 'GHS', firstWeekday: 1 })).toEqual({
      currency: 'GHS',
      locale: 'en-GH',
      weekStart: 0,
    });
  });

  it('falls back to Naira, en-NG and Monday for unknown or missing values', () => {
    expect(settingsFromDevice({ languageTag: null, currencyCode: 'XYZ', firstWeekday: null })).toEqual({
      currency: 'NGN',
      locale: 'en-NG',
      weekStart: 1,
    });
  });
});

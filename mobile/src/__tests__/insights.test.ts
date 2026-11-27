import { describe, expect, it } from 'vitest';

import { periodRange } from '../core/dates';
import { transactionsToCsv } from '../core/export';
import { smoothPath } from '../core/geometry';
import { demoData } from '../data/demoSeed';
import { biggestWeekday, categoryBreakdown, heatLevel, heatmap, loggingStreak, weekTrend } from '../core/insights';
import { at, tx } from './helpers';

const NOW = at(2026, 11, 27, 15); // Friday

describe('weekTrend', () => {
  it('returns Mon–Sun with today, the peak and the total', () => {
    const t = weekTrend([tx(3280, at(2026, 11, 23)), tx(7400, at(2026, 11, 26)), tx(6000, at(2026, 11, 27))], NOW, 'NGN');
    expect(t.days).toHaveLength(7);
    expect(t.todayIndex).toBe(4);
    expect(t.peakIndex).toBe(3);
    expect(t.totalMinor).toBe(16680);
    expect(t.days.slice(5).every((d) => d.future)).toBe(true);
  });

  it('has no peak in an empty week', () => {
    expect(weekTrend([], NOW, 'NGN').peakIndex).toBe(-1);
  });
});

describe('heatmap', () => {
  it('shades days relative to the busiest day', () => {
    expect([0, 1, 25, 26, 50, 51, 75, 76, 100].map((v) => heatLevel(v, 100))).toEqual([0, 1, 1, 2, 2, 3, 3, 4, 4]);
    expect(heatLevel(5, 0)).toBe(0);
  });

  it('lays out November 2026 with Monday-first columns', () => {
    const h = heatmap([tx(1000, at(2026, 11, 6)), tx(4000, at(2026, 11, 27))], periodRange(NOW, 'month'), 'NGN', NOW);
    expect(h.days).toHaveLength(30);
    expect(h.leadingBlanks).toBe(6); // 1 Nov is a Sunday
    expect(h.totalMinor).toBe(5000);
    expect(h.days[26]).toMatchObject({ isToday: true, level: 4 });
    expect(h.days[5].level).toBe(1);
    expect(h.days[29].future).toBe(true);
  });
});

describe('loggingStreak', () => {
  it('counts consecutive days ending today', () => {
    expect(loggingStreak([tx(1, at(2026, 11, 25)), tx(1, at(2026, 11, 26)), tx(1, at(2026, 11, 27))], NOW)).toBe(3);
  });

  it('keeps yesterday’s streak alive before today’s first entry', () => {
    expect(loggingStreak([tx(1, at(2026, 11, 25)), tx(1, at(2026, 11, 26))], NOW)).toBe(2);
  });

  it('is zero after a missed day, and ignores deleted entries', () => {
    expect(loggingStreak([tx(1, at(2026, 11, 24))], NOW)).toBe(0);
    expect(loggingStreak([tx(1, at(2026, 11, 27), { deletedAt: NOW })], NOW)).toBe(0);
  });
});

describe('biggestWeekday', () => {
  it('finds the weekday with the highest average', () => {
    const fridays = [tx(7000, at(2026, 11, 6)), tx(7200, at(2026, 11, 13)), tx(7100, at(2026, 11, 20))];
    const result = biggestWeekday([...fridays, tx(3000, at(2026, 11, 10))], periodRange(NOW, 'month'), 'NGN', NOW);
    expect(result?.weekday).toBe(5);
  });

  it('needs more than one week of data', () => {
    const early = at(2026, 11, 4);
    expect(biggestWeekday([tx(9000, at(2026, 11, 3))], periodRange(early, 'month'), 'NGN', early)).toBeNull();
  });
});

describe('categoryBreakdown', () => {
  it('sorts categories by spend with percentages', () => {
    const shares = categoryBreakdown(
      [tx(300, NOW, { categoryId: 'transport' }), tx(700, NOW, { categoryId: 'food-dining' }), tx(50, NOW, { currency: 'USD' })],
      periodRange(NOW, 'month'),
      'NGN',
    );
    expect(shares.map((s) => [s.category.id, s.percent])).toEqual([['food-dining', 70], ['transport', 30]]);
  });
});

describe('CSV export', () => {
  it('exports oldest first with escaped notes', () => {
    const csv = transactionsToCsv([
      tx(328000, at(2026, 11, 27, 9), { note: 'Bus, to "work"' }),
      tx(150, at(2026, 11, 26, 8), { categoryId: 'food-dining', currency: 'USD' }),
    ]);
    expect(csv.split('\n')).toEqual([
      'Date,Category,Amount,Currency,Note',
      '2026-11-26 08:00,Food & Dining,1.50,USD,',
      '2026-11-27 09:00,Transportation,3280.00,NGN,"Bus, to ""work"""',
    ]);
  });
});

describe('smoothPath', () => {
  it('starts at the first point and ends at the last', () => {
    const d = smoothPath([[0, 10], [10, 0], [20, 10]]);
    expect(d.startsWith('M0.0 10.0')).toBe(true);
    expect(d.endsWith('20.0 10.0')).toBe(true);
    expect(d.match(/C/g)).toHaveLength(2);
    expect(smoothPath([])).toBe('');
  });
});

describe('demo data (preview builds only)', () => {
  it('creates about a month of entries ending today and a budget', () => {
    const { transactions, plans } = demoData(NOW, 'NGN');
    expect(transactions.length).toBeGreaterThan(30);
    expect(Math.max(...transactions.map((t) => t.occurredAt))).toBeLessThan(at(2026, 11, 28, 0));
    expect(Math.min(...transactions.map((t) => t.occurredAt))).toBeGreaterThanOrEqual(at(2026, 10, 29, 0));
    expect(plans.at(-1)).toMatchObject({ amountMinor: 13_000_000, period: 'month' });
  });
});

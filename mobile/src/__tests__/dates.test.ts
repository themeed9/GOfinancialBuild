import { describe, expect, it } from 'vitest';

import {
  addDays,
  daysInRange,
  nextPeriodStart,
  periodRange,
  startOfPeriod,
  weeksOfMonth,
} from '../core/dates';
import { at } from './helpers';

describe('dates', () => {
  it('runs in a timezone with daylight saving (set in vitest.setup.ts)', () => {
    expect(process.env.TZ).toBe('America/New_York');
  });

  describe('startOfPeriod', () => {
    it('starts weeks on Monday by default', () => {
      // Wednesday 18 Nov 2026 → Monday 16 Nov
      expect(startOfPeriod(at(2026, 11, 18), 'week')).toBe(at(2026, 11, 16, 0));
    });

    it('supports Sunday-start weeks', () => {
      expect(startOfPeriod(at(2026, 11, 18), 'week', 0)).toBe(at(2026, 11, 15, 0));
    });

    it('treats the week-start day itself as the start of its week', () => {
      expect(startOfPeriod(at(2026, 11, 16, 23), 'week')).toBe(at(2026, 11, 16, 0));
    });

    it('handles day, month and year', () => {
      expect(startOfPeriod(at(2026, 11, 18, 15), 'day')).toBe(at(2026, 11, 18, 0));
      expect(startOfPeriod(at(2026, 11, 18), 'month')).toBe(at(2026, 11, 1, 0));
      expect(startOfPeriod(at(2026, 11, 18), 'year')).toBe(at(2026, 1, 1, 0));
    });
  });

  describe('nextPeriodStart', () => {
    it('moves to the next period for every kind', () => {
      expect(nextPeriodStart(at(2026, 12, 31, 0), 'day')).toBe(at(2027, 1, 1, 0));
      expect(nextPeriodStart(at(2026, 11, 16, 0), 'week')).toBe(at(2026, 11, 23, 0));
      expect(nextPeriodStart(at(2026, 1, 1, 0), 'month')).toBe(at(2026, 2, 1, 0));
      expect(nextPeriodStart(at(2026, 1, 1, 0), 'year')).toBe(at(2027, 1, 1, 0));
    });
  });

  describe('daylight saving', () => {
    it('keeps a week at 7 days when clocks go back (1 Nov 2026)', () => {
      const week = periodRange(at(2026, 10, 28), 'week'); // Mon 26 Oct – Sun 1 Nov
      expect(daysInRange(week)).toBe(7);
      expect(week.end).toBe(at(2026, 11, 2, 0));
    });

    it('keeps a week at 7 days when clocks go forward (8 Mar 2026)', () => {
      const week = periodRange(at(2026, 3, 8), 'week'); // Mon 2 – Sun 8 Mar
      expect(daysInRange(week)).toBe(7);
      expect(week.end).toBe(at(2026, 3, 9, 0));
    });

    it('adds calendar days, not 24-hour blocks', () => {
      expect(addDays(at(2026, 10, 31, 0), 1)).toBe(at(2026, 11, 1, 0));
      expect(addDays(at(2026, 11, 1, 0), 1)).toBe(at(2026, 11, 2, 0));
    });
  });

  describe('weeksOfMonth', () => {
    it('returns 4 weeks for February 2027 (starts on a Monday)', () => {
      expect(weeksOfMonth(at(2027, 2, 10))).toHaveLength(4);
    });

    it('returns 5 weeks for January 2026', () => {
      const weeks = weeksOfMonth(at(2026, 1, 10));
      expect(weeks).toHaveLength(5);
      expect(weeks[0]).toEqual({ start: at(2026, 1, 1, 0), end: at(2026, 1, 5, 0) });
      expect(weeks[4]).toEqual({ start: at(2026, 1, 26, 0), end: at(2026, 2, 1, 0) });
    });

    it('returns 6 weeks for November 2026, clipped to the month', () => {
      const weeks = weeksOfMonth(at(2026, 11, 18));
      expect(weeks).toHaveLength(6);
      expect(weeks[0]).toEqual({ start: at(2026, 11, 1, 0), end: at(2026, 11, 2, 0) });
      expect(weeks[5]).toEqual({ start: at(2026, 11, 30, 0), end: at(2026, 12, 1, 0) });
    });

    it('covers every day of the month exactly once', () => {
      const weeks = weeksOfMonth(at(2026, 8, 15));
      const days = weeks.reduce((sum, w) => sum + daysInRange(w), 0);
      expect(days).toBe(31);
      weeks.slice(1).forEach((w, i) => expect(w.start).toBe(weeks[i].end));
    });
  });
});

/**
 * Numbers behind the home trend card and the Insight screen.
 * Pure functions over the transaction list, in the user's currency.
 */
import { getCategory } from './categories';
import { addDays, DEFAULT_WEEK_START, periodRange, startOfDay, type DateRange, type WeekStart } from './dates';
import { spentInRange } from './summaries';
import type { Category, Transaction } from './types';

export interface DayTotal {
  /** Start of the day, epoch ms */
  date: number;
  spentMinor: number;
  /** After today */
  future: boolean;
  isToday: boolean;
}

function dayTotals(transactions: readonly Transaction[], range: DateRange, currency: string, now: number): DayTotal[] {
  const today = startOfDay(now);
  const days: DayTotal[] = [];
  for (let d = range.start; d < range.end; d = addDays(d, 1)) {
    days.push({
      date: d,
      spentMinor: spentInRange(transactions, { start: d, end: addDays(d, 1) }, currency),
      future: d > today,
      isToday: d === today,
    });
  }
  return days;
}

// ── Home: this week's curve ───────────────────────────────────

export interface WeekTrend {
  days: DayTotal[];
  totalMinor: number;
  /** Index of the highest past/present day, or -1 when nothing is spent */
  peakIndex: number;
  todayIndex: number;
}

export function weekTrend(
  transactions: readonly Transaction[],
  now: number,
  currency: string,
  weekStart: WeekStart = DEFAULT_WEEK_START,
): WeekTrend {
  const days = dayTotals(transactions, periodRange(now, 'week', weekStart), currency, now);
  let peakIndex = -1;
  days.forEach((d, i) => {
    if (!d.future && d.spentMinor > 0 && (peakIndex === -1 || d.spentMinor > days[peakIndex].spentMinor)) peakIndex = i;
  });
  return {
    days,
    totalMinor: days.reduce((s, d) => s + d.spentMinor, 0),
    peakIndex,
    todayIndex: days.findIndex((d) => d.isToday),
  };
}

// ── Insight: month (or week) heatmap ──────────────────────────

export type HeatLevel = 0 | 1 | 2 | 3 | 4;

export interface HeatDay extends DayTotal {
  level: HeatLevel;
}

/** Shade relative to the busiest day in view: none, ≤25%, ≤50%, ≤75%, above. */
export function heatLevel(spentMinor: number, maxMinor: number): HeatLevel {
  if (spentMinor <= 0 || maxMinor <= 0) return 0;
  const r = spentMinor / maxMinor;
  return r <= 0.25 ? 1 : r <= 0.5 ? 2 : r <= 0.75 ? 3 : 4;
}

export interface Heatmap {
  range: DateRange;
  days: HeatDay[];
  totalMinor: number;
  /** 0 = first column; days before the period start are blank */
  leadingBlanks: number;
}

export function heatmap(
  transactions: readonly Transaction[],
  range: DateRange,
  currency: string,
  now: number,
  weekStart: WeekStart = DEFAULT_WEEK_START,
): Heatmap {
  const totals = dayTotals(transactions, range, currency, now);
  const max = Math.max(0, ...totals.map((d) => d.spentMinor));
  const firstWeekday = new Date(range.start).getDay();
  return {
    range,
    days: totals.map((d) => ({ ...d, level: heatLevel(d.spentMinor, max) })),
    totalMinor: totals.reduce((s, d) => s + d.spentMinor, 0),
    leadingBlanks: (firstWeekday - weekStart + 7) % 7,
  };
}

// ── Habit: logging streak ─────────────────────────────────────

/**
 * Consecutive days with at least one entry, ending today — or yesterday,
 * so the streak does not look broken before today's first entry.
 */
export function loggingStreak(transactions: readonly Transaction[], now: number): number {
  const days = new Set(transactions.filter((t) => t.deletedAt === null).map((t) => startOfDay(t.occurredAt)));
  let day = startOfDay(now);
  if (!days.has(day)) day = addDays(day, -1);
  let streak = 0;
  while (days.has(day)) {
    streak += 1;
    day = addDays(day, -1);
  }
  return streak;
}

// ── "Fridays are your biggest days" ───────────────────────────

export interface BiggestWeekday {
  /** 0 = Sunday … 6 = Saturday */
  weekday: number;
  averageMinor: number;
}

/**
 * Weekday with the highest average spend over the elapsed part of `range`.
 * Needs at least two of each counted weekday so one big day is not a pattern.
 */
export function biggestWeekday(
  transactions: readonly Transaction[],
  range: DateRange,
  currency: string,
  now: number,
): BiggestWeekday | null {
  const sums = new Array(7).fill(0);
  const counts = new Array(7).fill(0);
  for (const d of dayTotals(transactions, range, currency, now)) {
    if (d.future) continue;
    const wd = new Date(d.date).getDay();
    sums[wd] += d.spentMinor;
    counts[wd] += 1;
  }
  let best: BiggestWeekday | null = null;
  for (let wd = 0; wd < 7; wd++) {
    if (counts[wd] < 2 || sums[wd] === 0) continue;
    const averageMinor = Math.round(sums[wd] / counts[wd]);
    if (!best || averageMinor > best.averageMinor) best = { weekday: wd, averageMinor };
  }
  return best;
}

// ── Where it went ─────────────────────────────────────────────

export interface CategoryShare {
  category: Category;
  spentMinor: number;
  /** Whole-number percentage of the total */
  percent: number;
}

export function categoryBreakdown(transactions: readonly Transaction[], range: DateRange, currency: string): CategoryShare[] {
  const totals = new Map<string, number>();
  for (const t of transactions) {
    if (t.deletedAt !== null || t.currency !== currency || t.occurredAt < range.start || t.occurredAt >= range.end) continue;
    totals.set(t.categoryId, (totals.get(t.categoryId) ?? 0) + t.amountMinor);
  }
  const sum = [...totals.values()].reduce((s, v) => s + v, 0);
  return [...totals.entries()]
    .map(([id, spentMinor]) => ({ category: getCategory(id), spentMinor, percent: sum ? Math.round((spentMinor / sum) * 100) : 0 }))
    .sort((a, b) => b.spentMinor - a.spentMinor);
}

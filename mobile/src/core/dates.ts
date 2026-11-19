/**
 * Calendar helpers. All maths uses local calendar fields (setDate/setMonth)
 * rather than adding milliseconds, so periods stay correct across
 * daylight-saving changes.
 */

export type PeriodKind = 'day' | 'week' | 'month' | 'year';

/** 0 = Sunday, 1 = Monday, … 6 = Saturday */
export type WeekStart = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export const DEFAULT_WEEK_START: WeekStart = 1;

export interface DateRange {
  /** Inclusive start, epoch ms */
  start: number;
  /** Exclusive end, epoch ms */
  end: number;
}

export function startOfDay(time: number): number {
  const d = new Date(time);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function addDays(time: number, days: number): number {
  const d = new Date(time);
  d.setDate(d.getDate() + days);
  return d.getTime();
}

export function startOfPeriod(
  time: number,
  kind: PeriodKind,
  weekStart: WeekStart = DEFAULT_WEEK_START,
): number {
  const d = new Date(startOfDay(time));
  switch (kind) {
    case 'day':
      break;
    case 'week': {
      const diff = (d.getDay() - weekStart + 7) % 7;
      d.setDate(d.getDate() - diff);
      break;
    }
    case 'month':
      d.setDate(1);
      break;
    case 'year':
      d.setMonth(0, 1);
      break;
  }
  return d.getTime();
}

/** Start of the period that follows the one beginning at `periodStart`. */
export function nextPeriodStart(periodStart: number, kind: PeriodKind): number {
  const d = new Date(periodStart);
  switch (kind) {
    case 'day':
      d.setDate(d.getDate() + 1);
      break;
    case 'week':
      d.setDate(d.getDate() + 7);
      break;
    case 'month':
      d.setMonth(d.getMonth() + 1, 1);
      break;
    case 'year':
      d.setFullYear(d.getFullYear() + 1, 0, 1);
      break;
  }
  return d.getTime();
}

export function periodRange(
  time: number,
  kind: PeriodKind,
  weekStart: WeekStart = DEFAULT_WEEK_START,
): DateRange {
  const start = startOfPeriod(time, kind, weekStart);
  return { start, end: nextPeriodStart(start, kind) };
}

/** Whole calendar days in a range (DST-safe). */
export function daysInRange(range: DateRange): number {
  let days = 0;
  for (let t = range.start; t < range.end; t = addDays(t, 1)) days += 1;
  return days;
}

/**
 * The weeks of the month containing `time`, clipped to that month.
 * A month touches 4, 5 or 6 weeks depending on where it starts,
 * so charts must not assume W1–W4.
 */
export function weeksOfMonth(
  time: number,
  weekStart: WeekStart = DEFAULT_WEEK_START,
): DateRange[] {
  const month = periodRange(time, 'month');
  const weeks: DateRange[] = [];
  let cursor = month.start;
  while (cursor < month.end) {
    const weekEnd = nextPeriodStart(startOfPeriod(cursor, 'week', weekStart), 'week');
    const end = Math.min(weekEnd, month.end);
    weeks.push({ start: cursor, end });
    cursor = end;
  }
  return weeks;
}

export function inRange(time: number, range: DateRange): boolean {
  return time >= range.start && time < range.end;
}

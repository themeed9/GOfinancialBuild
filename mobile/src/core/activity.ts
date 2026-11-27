/**
 * Daily active usage: the app reports "opened today" at most once per
 * local calendar day, so the count is one per user per day.
 */

/** Local calendar day as YYYY-MM-DD (used as the document id for the day). */
export function localDayKey(time: number): string {
  const d = new Date(time);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function shouldReportDailyOpen(lastReportedDay: string | null, now: number): boolean {
  return lastReportedDay !== localDayKey(now);
}

/**
 * Demo data for previews and screenshots. Only active when the app is built
 * with EXPO_PUBLIC_DEMO_DATA=1; normal builds never seed anything.
 */
import { addBudgetPlan } from '../core/budget/plans';
import { addDays, startOfDay } from '../core/dates';
import type { BudgetPlan, Transaction } from '../core/types';

export const DEMO_DATA_ENABLED = process.env.EXPO_PUBLIC_DEMO_DATA === '1';

const PATTERN: [string, number, string][] = [
  ['transport', 1500, 'Keke'],
  ['food-dining', 2720, 'Lunch'],
  ['shopping', 4100, 'Market'],
  ['transport', 3280, 'Bus to work'],
  ['bills', 7400, 'Electricity'],
  ['food-dining', 1800, 'Snacks'],
  ['entertainment', 2720, 'Cinema'],
  ['health', 1900, 'Pharmacy'],
];

/** About a month of entries ending today, plus a monthly budget with carry-over. */
export function demoData(now: number, currency: string): { transactions: Transaction[]; plans: BudgetPlan[] } {
  const transactions: Transaction[] = [];
  const today = startOfDay(now);
  for (let back = 0; back < 30; back++) {
    const day = addDays(today, -back);
    if (back % 9 === 4) continue; // a few quiet days
    const dow = new Date(day).getDay();
    const count = dow === 5 ? 3 : 1 + (back % 2);
    for (let k = 0; k < count; k++) {
      const [categoryId, base, note] = PATTERN[(back * 3 + k) % PATTERN.length];
      const at = day + (9 + k * 4) * 3_600_000;
      const amountMinor = (base + ((back * 137 + k * 59) % 900)) * 100;
      transactions.push({ id: `demo-${back}-${k}`, amountMinor, currency, categoryId, note, occurredAt: at, createdAt: at, updatedAt: at, deletedAt: null });
    }
  }
  let plans = addBudgetPlan([], { id: 'demo-plan-1', amountMinor: 120_000_00, currency, period: 'month', now: addDays(today, -45) });
  plans = addBudgetPlan(plans, { id: 'demo-plan-2', amountMinor: 130_000_00, currency, period: 'month', now });
  return { transactions, plans };
}

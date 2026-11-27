/**
 * Budget ledger: treats the budget as a running account instead of a
 * counter that resets every period.
 *
 * Each period's allocation is added to the account and each expense is
 * taken from it, so whatever is left over (or overspent) carries into the
 * next period. Nothing is stored except the raw transactions and the
 * budget history; every number here is derived from them, which means
 * editing or deleting an old transaction corrects all later balances.
 */
import {
  DEFAULT_WEEK_START,
  daysInRange,
  nextPeriodStart,
  startOfPeriod,
  type DateRange,
  type WeekStart,
} from '../dates';
import type { BudgetPlan, Transaction } from '../types';
import { sortPlans } from './plans';

export interface LedgerPeriod {
  range: DateRange;
  plan: BudgetPlan;
  /** Budget added for this period (pro-rated when the period is cut short) */
  allocatedMinor: number;
  /** Balance brought forward; negative when earlier periods overspent */
  carriedInMinor: number;
  spentMinor: number;
  /** allocated + carriedIn */
  availableMinor: number;
  /** available − spent; carried into the next period */
  closingMinor: number;
  /** True when a budget change cut this period short */
  prorated: boolean;
}

export interface BudgetLedger {
  currency: string | null;
  periods: LedgerPeriod[];
  /** The period containing `now`, if a budget is active */
  current: LedgerPeriod | null;
  /** What is left across all periods so far (negative = overspent) */
  balanceMinor: number;
  totalAllocatedMinor: number;
  totalSpentMinor: number;
  /** Transactions left out because they are in another currency */
  otherCurrencyCount: number;
}

export interface LedgerInput {
  plans: readonly BudgetPlan[];
  transactions: readonly Transaction[];
  now: number;
  weekStart?: WeekStart;
}

const EMPTY: BudgetLedger = {
  currency: null,
  periods: [],
  current: null,
  balanceMinor: 0,
  totalAllocatedMinor: 0,
  totalSpentMinor: 0,
  otherCurrencyCount: 0,
};

/**
 * The ledger runs in the currency of the latest plan. Money cannot be
 * carried between currencies without an exchange rate, so setting a
 * budget in a new currency starts a new account.
 */
function plansInLatestCurrency(plans: readonly BudgetPlan[], now: number): BudgetPlan[] {
  const started = sortPlans(plans).filter((p) => p.effectiveFrom <= now);
  const latest = started.at(-1);
  if (!latest) return [];
  let first = started.length - 1;
  while (first > 0 && started[first - 1].currency === latest.currency) first -= 1;
  return started.slice(first);
}

function buildPeriods(plans: BudgetPlan[], now: number, weekStart: WeekStart) {
  const periods: { range: DateRange; plan: BudgetPlan; allocatedMinor: number; prorated: boolean }[] = [];

  plans.forEach((plan, i) => {
    const segmentEnd = plans[i + 1]?.effectiveFrom ?? Number.POSITIVE_INFINITY;
    let cursor = plan.effectiveFrom;

    while (cursor < segmentEnd && cursor <= now) {
      const fullStart = startOfPeriod(cursor, plan.period, weekStart);
      const full: DateRange = { start: fullStart, end: nextPeriodStart(fullStart, plan.period) };
      const range: DateRange = {
        start: Math.max(full.start, cursor),
        end: Math.min(full.end, segmentEnd),
      };
      const prorated = range.start !== full.start || range.end !== full.end;
      const allocatedMinor = prorated
        ? Math.round((plan.amountMinor * daysInRange(range)) / daysInRange(full))
        : plan.amountMinor;

      periods.push({ range, plan, allocatedMinor, prorated });
      cursor = range.end;
    }
  });

  return periods;
}

export function buildLedger({
  plans,
  transactions,
  now,
  weekStart = DEFAULT_WEEK_START,
}: LedgerInput): BudgetLedger {
  const active = plansInLatestCurrency(plans, now);
  if (active.length === 0) return EMPTY;

  const currency = active[0].currency;
  const skeleton = buildPeriods(active, now, weekStart);

  const live = transactions.filter((t) => t.deletedAt === null);
  const counted = live.filter((t) => t.currency === currency);
  const otherCurrencyCount = live.length - counted.length;

  let balance = 0;
  let totalAllocated = 0;
  let totalSpent = 0;

  const periods: LedgerPeriod[] = skeleton.map(({ range, plan, allocatedMinor, prorated }) => {
    let spentMinor = 0;
    for (const t of counted) {
      if (t.occurredAt >= range.start && t.occurredAt < range.end) spentMinor += t.amountMinor;
    }
    const carriedInMinor = balance;
    const availableMinor = allocatedMinor + carriedInMinor;
    const closingMinor = availableMinor - spentMinor;

    balance = closingMinor;
    totalAllocated += allocatedMinor;
    totalSpent += spentMinor;

    return { range, plan, allocatedMinor, carriedInMinor, spentMinor, availableMinor, closingMinor, prorated };
  });

  const last = periods.at(-1) ?? null;
  const current = last && now >= last.range.start && now < last.range.end ? last : null;

  return {
    currency,
    periods,
    current,
    balanceMinor: balance,
    totalAllocatedMinor: totalAllocated,
    totalSpentMinor: totalSpent,
    otherCurrencyCount,
  };
}

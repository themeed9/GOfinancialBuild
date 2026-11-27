import { DEFAULT_WEEK_START, startOfPeriod, type PeriodKind, type WeekStart } from '../dates';
import type { BudgetPlan } from '../types';

export interface NewPlanInput {
  id: string;
  amountMinor: number;
  currency: string;
  period: PeriodKind;
  now: number;
  weekStart?: WeekStart;
}

/**
 * Returns the budget history with a new plan added.
 *
 * The new plan starts at the beginning of the *current* period, so
 * spending already logged this week/month counts against it. When the
 * period kind changes (e.g. weekly → monthly), it starts at whichever
 * current period began later, so days already covered by the old plan
 * keep their old budget. Plans that would start on or after the new
 * one (edits within the same period) are replaced.
 */
export function addBudgetPlan(history: readonly BudgetPlan[], input: NewPlanInput): BudgetPlan[] {
  if (!Number.isInteger(input.amountMinor) || input.amountMinor <= 0) {
    throw new RangeError('Budget amount must be a positive whole number of minor units');
  }
  const weekStart = input.weekStart ?? DEFAULT_WEEK_START;
  const sorted = sortPlans(history);
  const latest = sorted.at(-1);

  let effectiveFrom = startOfPeriod(input.now, input.period, weekStart);
  if (latest && latest.currency === input.currency) {
    effectiveFrom = Math.max(effectiveFrom, startOfPeriod(input.now, latest.period, weekStart));
  }

  const plan: BudgetPlan = {
    id: input.id,
    amountMinor: input.amountMinor,
    currency: input.currency,
    period: input.period,
    effectiveFrom,
    createdAt: input.now,
  };
  return [...sorted.filter((p) => p.effectiveFrom < effectiveFrom), plan];
}

export function sortPlans(plans: readonly BudgetPlan[]): BudgetPlan[] {
  return [...plans].sort((a, b) => a.effectiveFrom - b.effectiveFrom || a.createdAt - b.createdAt);
}

export function currentPlan(plans: readonly BudgetPlan[], now: number): BudgetPlan | null {
  const active = sortPlans(plans).filter((p) => p.effectiveFrom <= now);
  return active.at(-1) ?? null;
}

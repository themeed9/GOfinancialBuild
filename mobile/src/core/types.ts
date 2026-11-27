import type { PeriodKind } from './dates';

export interface Transaction {
  id: string;
  /** Integer minor units (kobo, cents, …). Always positive. */
  amountMinor: number;
  /** ISO 4217 code the amount was entered in */
  currency: string;
  categoryId: string;
  note: string;
  /** When the spending happened, epoch ms */
  occurredAt: number;
  createdAt: number;
  updatedAt: number;
  /** Soft delete, so a future sync can propagate deletions */
  deletedAt: number | null;
}

/**
 * One entry in the budget history. Plans are never edited in place:
 * changing the budget adds a new plan, so past periods keep the amount
 * that applied at the time.
 */
export interface BudgetPlan {
  id: string;
  amountMinor: number;
  currency: string;
  period: PeriodKind;
  /** First moment this plan applies (start of a calendar day), epoch ms */
  effectiveFrom: number;
  createdAt: number;
}

export interface Category {
  /** Slug, e.g. "food-dining" */
  id: string;
  name: string;
  icon: string;
}

import type { BudgetPlan, Transaction } from '../core/types';

/** Local-time timestamp; month is 1-based for readability. */
export function at(year: number, month: number, day: number, hour = 12): number {
  return new Date(year, month - 1, day, hour).getTime();
}

let seq = 0;

export function tx(amountMinor: number, occurredAt: number, overrides: Partial<Transaction> = {}): Transaction {
  seq += 1;
  return {
    id: `tx-${seq}`,
    amountMinor,
    currency: 'NGN',
    categoryId: 'transport',
    note: '',
    occurredAt,
    createdAt: occurredAt,
    updatedAt: occurredAt,
    deletedAt: null,
    ...overrides,
  };
}

export function plan(overrides: Partial<BudgetPlan> & Pick<BudgetPlan, 'effectiveFrom'>): BudgetPlan {
  seq += 1;
  return {
    id: `plan-${seq}`,
    amountMinor: 10_000_00,
    currency: 'NGN',
    period: 'week',
    createdAt: overrides.effectiveFrom,
    ...overrides,
  };
}

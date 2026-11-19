import { describe, expect, it } from 'vitest';

import { buildLedger } from '../core/budget/ledger';
import { addBudgetPlan, currentPlan } from '../core/budget/plans';
import { at, plan, tx } from './helpers';

const NAIRA = 100; // kobo per naira
const NOW = at(2026, 11, 18); // Wednesday; weeks start Monday 2, 9, 16 Nov
const WEEKLY_10K = plan({ amountMinor: 10_000 * NAIRA, period: 'week', effectiveFrom: at(2026, 11, 2, 0) });

describe('budget ledger', () => {
  it('returns an empty ledger when no budget is set', () => {
    const ledger = buildLedger({ plans: [], transactions: [tx(500, NOW)], now: NOW });
    expect(ledger.current).toBeNull();
    expect(ledger.periods).toEqual([]);
    expect(ledger.balanceMinor).toBe(0);
  });

  it('carries unspent money into the next week instead of resetting', () => {
    const ledger = buildLedger({
      plans: [WEEKLY_10K],
      transactions: [tx(6_000 * NAIRA, at(2026, 11, 4))],
      now: NOW,
    });

    const [week1, week2, week3] = ledger.periods;
    expect(ledger.periods).toHaveLength(3);
    expect(week1.closingMinor).toBe(4_000 * NAIRA);
    expect(week2.carriedInMinor).toBe(4_000 * NAIRA);
    expect(week2.availableMinor).toBe(14_000 * NAIRA);
    expect(week3.availableMinor).toBe(24_000 * NAIRA);
    expect(ledger.current).toBe(week3);
    expect(ledger.balanceMinor).toBe(24_000 * NAIRA);
  });

  it('carries overspending forward as a negative balance', () => {
    const ledger = buildLedger({
      plans: [WEEKLY_10K],
      transactions: [tx(13_000 * NAIRA, at(2026, 11, 3)), tx(2_000 * NAIRA, at(2026, 11, 17))],
      now: NOW,
    });

    const [week1, week2, week3] = ledger.periods;
    expect(week1.closingMinor).toBe(-3_000 * NAIRA);
    expect(week2.carriedInMinor).toBe(-3_000 * NAIRA);
    expect(week2.closingMinor).toBe(7_000 * NAIRA);
    expect(week3.spentMinor).toBe(2_000 * NAIRA);
    expect(ledger.balanceMinor).toBe(15_000 * NAIRA);
  });

  it('keeps every expense in the account: balance = all budget − all spending', () => {
    const transactions = [
      tx(3_280 * NAIRA, at(2026, 11, 2, 8)),
      tx(4_000 * NAIRA, at(2026, 11, 8, 23)),
      tx(12_240 * NAIRA, at(2026, 11, 12)),
      tx(1_520 * NAIRA, at(2026, 11, 18, 9)),
    ];
    const ledger = buildLedger({ plans: [WEEKLY_10K], transactions, now: NOW });

    expect(ledger.totalAllocatedMinor).toBe(30_000 * NAIRA);
    expect(ledger.totalSpentMinor).toBe(21_040 * NAIRA);
    expect(ledger.balanceMinor).toBe(ledger.totalAllocatedMinor - ledger.totalSpentMinor);
  });

  it('puts expenses at the exact week boundary into the right week', () => {
    const ledger = buildLedger({
      plans: [WEEKLY_10K],
      transactions: [
        tx(100, at(2026, 11, 8, 23) + 59 * 60_000), // Sun 23:59
        tx(200, at(2026, 11, 9, 0)), // Mon 00:00
      ],
      now: NOW,
    });
    expect(ledger.periods[0].spentMinor).toBe(100);
    expect(ledger.periods[1].spentMinor).toBe(200);
  });

  it('ignores deleted transactions, and edits to old ones correct later balances', () => {
    const old = tx(5_000 * NAIRA, at(2026, 11, 3));
    const deleted = tx(9_999 * NAIRA, at(2026, 11, 10), { deletedAt: at(2026, 11, 11) });

    const before = buildLedger({ plans: [WEEKLY_10K], transactions: [old, deleted], now: NOW });
    const after = buildLedger({
      plans: [WEEKLY_10K],
      transactions: [{ ...old, amountMinor: 1_000 * NAIRA }, deleted],
      now: NOW,
    });

    expect(before.balanceMinor).toBe(25_000 * NAIRA);
    expect(after.balanceMinor).toBe(29_000 * NAIRA);
    expect(after.current?.carriedInMinor).toBe(19_000 * NAIRA);
  });

  it('does not count spending from before the budget existed', () => {
    const ledger = buildLedger({
      plans: [WEEKLY_10K],
      transactions: [tx(50_000 * NAIRA, at(2026, 10, 30))],
      now: NOW,
    });
    expect(ledger.totalSpentMinor).toBe(0);
  });

  it('ignores plans that have not started yet', () => {
    const future = plan({ effectiveFrom: at(2026, 12, 1, 0) });
    expect(buildLedger({ plans: [future], transactions: [], now: NOW }).current).toBeNull();
  });

  it('starts a new account when the budget currency changes', () => {
    const usd = plan({ amountMinor: 100_00, currency: 'USD', effectiveFrom: at(2026, 11, 16, 0) });
    const ledger = buildLedger({
      plans: [WEEKLY_10K, usd],
      transactions: [tx(2_000 * NAIRA, at(2026, 11, 4)), tx(25_00, at(2026, 11, 17), { currency: 'USD' })],
      now: NOW,
    });

    expect(ledger.currency).toBe('USD');
    expect(ledger.periods).toHaveLength(1);
    expect(ledger.balanceMinor).toBe(75_00);
    expect(ledger.otherCurrencyCount).toBe(1);
  });
});

describe('budget changes', () => {
  it('starts the first budget at the beginning of the current period', () => {
    const plans = addBudgetPlan([], { id: 'p1', amountMinor: 1000, currency: 'NGN', period: 'week', now: NOW });
    expect(plans).toHaveLength(1);
    expect(plans[0].effectiveFrom).toBe(at(2026, 11, 16, 0));
  });

  it('applies a mid-week amount change to this week only; past weeks keep the old amount', () => {
    const plans = addBudgetPlan([WEEKLY_10K], {
      id: 'p2',
      amountMinor: 15_000 * NAIRA,
      currency: 'NGN',
      period: 'week',
      now: NOW,
    });
    const ledger = buildLedger({ plans, transactions: [], now: NOW });

    expect(ledger.periods.map((p) => p.allocatedMinor)).toEqual([10_000 * NAIRA, 10_000 * NAIRA, 15_000 * NAIRA]);
    expect(ledger.balanceMinor).toBe(35_000 * NAIRA);
    expect(currentPlan(plans, NOW)?.id).toBe('p2');
  });

  it('replaces an earlier change made in the same period', () => {
    let plans = addBudgetPlan([WEEKLY_10K], { id: 'a', amountMinor: 1, currency: 'NGN', period: 'week', now: NOW });
    plans = addBudgetPlan(plans, { id: 'b', amountMinor: 2, currency: 'NGN', period: 'week', now: NOW + 1000 });
    expect(plans.map((p) => p.id)).toEqual([WEEKLY_10K.id, 'b']);
  });

  it('switching weekly → monthly mid-month pro-rates the rest of the month', () => {
    const plans = addBudgetPlan([WEEKLY_10K], {
      id: 'monthly',
      amountMinor: 40_000 * NAIRA,
      currency: 'NGN',
      period: 'month',
      now: NOW,
    });
    const ledger = buildLedger({ plans, transactions: [], now: NOW });
    const current = ledger.current!;

    // Weeks of 2 and 9 Nov keep their weekly budget …
    expect(ledger.periods).toHaveLength(3);
    // … and 16–30 Nov is 15 of 30 days of the monthly amount.
    expect(current.range).toEqual({ start: at(2026, 11, 16, 0), end: at(2026, 12, 1, 0) });
    expect(current.prorated).toBe(true);
    expect(current.allocatedMinor).toBe(20_000 * NAIRA);
    expect(current.carriedInMinor).toBe(20_000 * NAIRA);
  });

  it('switching monthly → weekly cuts the month short and pro-rates it', () => {
    const monthly = plan({ amountMinor: 30_000 * NAIRA, period: 'month', effectiveFrom: at(2026, 11, 1, 0) });
    const plans = addBudgetPlan([monthly], {
      id: 'weekly',
      amountMinor: 7_000 * NAIRA,
      currency: 'NGN',
      period: 'week',
      now: NOW,
    });
    const [partMonth, week] = buildLedger({ plans, transactions: [], now: NOW }).periods;

    expect(partMonth.range).toEqual({ start: at(2026, 11, 1, 0), end: at(2026, 11, 16, 0) });
    expect(partMonth.allocatedMinor).toBe(15_000 * NAIRA); // 15 of 30 days
    expect(week.allocatedMinor).toBe(7_000 * NAIRA);
    expect(week.prorated).toBe(false);
  });

  it('rejects zero, negative and fractional amounts', () => {
    for (const amountMinor of [0, -5, 1.5]) {
      expect(() =>
        addBudgetPlan([], { id: 'x', amountMinor, currency: 'NGN', period: 'week', now: NOW }),
      ).toThrow(RangeError);
    }
  });
});

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { addBudgetPlan } from '../core/budget/plans';
import { migrate, SCHEMA_VERSION } from '../data/db';
import {
  deleteAllData,
  listBudgetPlans,
  listTransactions,
  loadSettings,
  replaceBudgetPlans,
  saveSettings,
  saveTransaction,
  softDeleteTransaction,
  type Settings,
} from '../data/repository';
import { at, tx } from './helpers';
import { createTestDb } from './nodeDb';

const DEFAULTS: Settings = { currency: 'NGN', locale: 'en-NG', weekStart: 1 };

describe('repository (SQLite)', () => {
  let db: ReturnType<typeof createTestDb>;

  beforeEach(async () => {
    db = createTestDb();
    await migrate(db);
  });

  afterEach(() => db.close());

  it('migrates to the latest schema and is safe to run twice', async () => {
    await migrate(db);
    const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version', []);
    expect(row?.user_version).toBe(SCHEMA_VERSION);
  });

  it('saves and lists transactions newest first', async () => {
    const older = tx(328000, at(2026, 11, 17));
    const newer = tx(150050, at(2026, 11, 18), { note: 'Bus to work' });
    await saveTransaction(db, older);
    await saveTransaction(db, newer);

    expect(await listTransactions(db)).toEqual([newer, older]);
  });

  it('updates a transaction in place without changing createdAt', async () => {
    const original = tx(1000, at(2026, 11, 18));
    await saveTransaction(db, original);
    await saveTransaction(db, { ...original, amountMinor: 2500, createdAt: 0, updatedAt: at(2026, 11, 19) });

    const [saved] = await listTransactions(db);
    expect(saved.amountMinor).toBe(2500);
    expect(saved.createdAt).toBe(original.createdAt);
    expect(saved.updatedAt).toBe(at(2026, 11, 19));
  });

  it('soft-deletes so deleted rows disappear from the list but stay in the table', async () => {
    const t = tx(1000, at(2026, 11, 18));
    await saveTransaction(db, t);
    await softDeleteTransaction(db, t.id, at(2026, 11, 19));

    expect(await listTransactions(db)).toEqual([]);
    const raw = await db.getFirstAsync<{ deleted_at: number }>('SELECT deleted_at FROM transactions', []);
    expect(raw?.deleted_at).toBe(at(2026, 11, 19));
  });

  it('rejects zero or negative amounts at the database level', async () => {
    await expect(saveTransaction(db, tx(0, at(2026, 11, 18)))).rejects.toThrow();
    await expect(saveTransaction(db, tx(-5, at(2026, 11, 18)))).rejects.toThrow();
  });

  it('round-trips the budget plan history', async () => {
    let plans = addBudgetPlan([], { id: 'a', amountMinor: 100, currency: 'NGN', period: 'week', now: at(2026, 11, 4) });
    plans = addBudgetPlan(plans, { id: 'b', amountMinor: 200, currency: 'NGN', period: 'month', now: at(2026, 11, 18) });
    await replaceBudgetPlans(db, plans);

    expect(await listBudgetPlans(db)).toEqual(plans);
  });

  it('leaves the old budget history untouched if saving fails part-way', async () => {
    const good = addBudgetPlan([], { id: 'a', amountMinor: 100, currency: 'NGN', period: 'week', now: at(2026, 11, 4) });
    await replaceBudgetPlans(db, good);

    const bad = [{ ...good[0], id: 'b' }, { ...good[0], id: 'c', amountMinor: -1 }];
    await expect(replaceBudgetPlans(db, bad)).rejects.toThrow();
    expect(await listBudgetPlans(db)).toEqual(good);
  });

  it('falls back to defaults and persists settings', async () => {
    expect(await loadSettings(db, DEFAULTS)).toEqual(DEFAULTS);
    await saveSettings(db, { currency: 'GHS', locale: 'en-GH', weekStart: 0 });
    expect(await loadSettings(db, DEFAULTS)).toEqual({ currency: 'GHS', locale: 'en-GH', weekStart: 0 });
  });

  it('ignores an invalid stored week start', async () => {
    await db.runAsync("INSERT INTO settings (key, value) VALUES ('weekStart', '9')", []);
    expect((await loadSettings(db, DEFAULTS)).weekStart).toBe(1);
  });

  it('deletes all data', async () => {
    await saveTransaction(db, tx(1000, at(2026, 11, 18)));
    await replaceBudgetPlans(db, addBudgetPlan([], { id: 'a', amountMinor: 1, currency: 'NGN', period: 'week', now: 0 }));
    await saveSettings(db, DEFAULTS);
    await deleteAllData(db);

    const count = async (table: string) =>
      (await db.getFirstAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM ${table}`, []))?.n;
    expect(await count('transactions')).toBe(0);
    expect(await count('budget_plans')).toBe(0);
    expect(await count('settings')).toBe(0);
  });
});

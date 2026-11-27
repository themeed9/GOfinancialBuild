import type { PeriodKind, WeekStart } from '../core/dates';
import type { BudgetPlan, Transaction } from '../core/types';
import type { Db } from './db';

interface TransactionRow {
  id: string;
  amount_minor: number;
  currency: string;
  category_id: string;
  note: string;
  occurred_at: number;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
}

interface PlanRow {
  id: string;
  amount_minor: number;
  currency: string;
  period: PeriodKind;
  effective_from: number;
  created_at: number;
}

const toTransaction = (r: TransactionRow): Transaction => ({
  id: r.id,
  amountMinor: r.amount_minor,
  currency: r.currency,
  categoryId: r.category_id,
  note: r.note,
  occurredAt: r.occurred_at,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  deletedAt: r.deleted_at,
});

const toPlan = (r: PlanRow): BudgetPlan => ({
  id: r.id,
  amountMinor: r.amount_minor,
  currency: r.currency,
  period: r.period,
  effectiveFrom: r.effective_from,
  createdAt: r.created_at,
});

// ── Transactions ──────────────────────────────────────────────

/** Live (not deleted) transactions, newest first. */
export async function listTransactions(db: Db): Promise<Transaction[]> {
  const rows = await db.getAllAsync<TransactionRow>(
    'SELECT * FROM transactions WHERE deleted_at IS NULL ORDER BY occurred_at DESC, created_at DESC',
    [],
  );
  return rows.map(toTransaction);
}

/** Insert, or overwrite an existing row with the same id. */
export async function saveTransaction(db: Db, t: Transaction): Promise<void> {
  await db.runAsync(
    `INSERT INTO transactions
       (id, amount_minor, currency, category_id, note, occurred_at, created_at, updated_at, deleted_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       amount_minor = excluded.amount_minor,
       currency = excluded.currency,
       category_id = excluded.category_id,
       note = excluded.note,
       occurred_at = excluded.occurred_at,
       updated_at = excluded.updated_at,
       deleted_at = excluded.deleted_at`,
    [t.id, t.amountMinor, t.currency, t.categoryId, t.note, t.occurredAt, t.createdAt, t.updatedAt, t.deletedAt],
  );
}

export async function softDeleteTransaction(db: Db, id: string, now: number): Promise<void> {
  await db.runAsync('UPDATE transactions SET deleted_at = ?, updated_at = ? WHERE id = ?', [now, now, id]);
}

// ── Budget plans ──────────────────────────────────────────────

export async function listBudgetPlans(db: Db): Promise<BudgetPlan[]> {
  const rows = await db.getAllAsync<PlanRow>(
    'SELECT * FROM budget_plans ORDER BY effective_from ASC, created_at ASC',
    [],
  );
  return rows.map(toPlan);
}

/** Replace the whole budget history (it is small) in one transaction. */
export async function replaceBudgetPlans(db: Db, plans: readonly BudgetPlan[]): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM budget_plans', []);
    for (const p of plans) {
      await db.runAsync(
        'INSERT INTO budget_plans (id, amount_minor, currency, period, effective_from, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [p.id, p.amountMinor, p.currency, p.period, p.effectiveFrom, p.createdAt],
      );
    }
  });
}

// ── Settings ──────────────────────────────────────────────────

export interface Settings {
  currency: string;
  locale: string;
  weekStart: WeekStart;
  /** Display name chosen on first run; null until the username step is done */
  username: string | null;
  /** Dark mode override; 'system' follows the phone */
  theme: ThemePreference;
}

export type ThemePreference = 'system' | 'light' | 'dark';

export async function loadSettings(db: Db, defaults: Settings): Promise<Settings> {
  const rows = await db.getAllAsync<{ key: string; value: string }>('SELECT key, value FROM settings', []);
  const stored = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const weekStart = Number(stored.weekStart);
  return {
    currency: stored.currency ?? defaults.currency,
    locale: stored.locale ?? defaults.locale,
    weekStart: Number.isInteger(weekStart) && weekStart >= 0 && weekStart <= 6
      ? (weekStart as WeekStart)
      : defaults.weekStart,
    username: stored.username ?? defaults.username,
    theme: stored.theme === 'light' || stored.theme === 'dark' ? stored.theme : defaults.theme,
  };
}

export async function saveSettings(db: Db, settings: Settings): Promise<void> {
  await db.withTransactionAsync(async () => {
    for (const [key, value] of Object.entries(settings)) {
      if (value === null) {
        await db.runAsync('DELETE FROM settings WHERE key = ?', [key]);
        continue;
      }
      await db.runAsync(
        'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
        [key, String(value)],
      );
    }
  });
}

// ── App metadata (not user preferences) ───────────────────────

/** Small internal values, e.g. the last day the daily "app opened" event was sent. */
export async function getMeta(db: Db, key: string): Promise<string | null> {
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', [`meta.${key}`]);
  return row?.value ?? null;
}

export async function setMeta(db: Db, key: string, value: string): Promise<void> {
  await db.runAsync(
    'INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    [`meta.${key}`, value],
  );
}

// ── Delete everything ─────────────────────────────────────────

/** Permanently removes every record (Settings → Delete all data). */
export async function deleteAllData(db: Db): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM transactions', []);
    await db.runAsync('DELETE FROM budget_plans', []);
    await db.runAsync('DELETE FROM settings', []);
  });
}

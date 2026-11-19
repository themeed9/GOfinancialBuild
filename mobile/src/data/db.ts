/**
 * The subset of expo-sqlite's database API the app uses. Keeping it this
 * small lets the tests run the real SQL against Node's built-in SQLite.
 */
export type BindValue = string | number | null;

export interface Db {
  execAsync(sql: string): Promise<void>;
  runAsync(sql: string, params: BindValue[]): Promise<unknown>;
  getAllAsync<T>(sql: string, params: BindValue[]): Promise<T[]>;
  getFirstAsync<T>(sql: string, params: BindValue[]): Promise<T | null>;
  withTransactionAsync(task: () => Promise<void>): Promise<void>;
}

export const DATABASE_NAME = 'gofinancial.db';

/**
 * Ordered schema migrations. Append new entries; never edit old ones.
 * PRAGMA user_version records how many have run.
 */
const MIGRATIONS: string[] = [
  `
  CREATE TABLE transactions (
    id TEXT PRIMARY KEY NOT NULL,
    amount_minor INTEGER NOT NULL CHECK (amount_minor > 0),
    currency TEXT NOT NULL,
    category_id TEXT NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    occurred_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted_at INTEGER
  );
  CREATE INDEX idx_transactions_occurred_at ON transactions (occurred_at);

  CREATE TABLE budget_plans (
    id TEXT PRIMARY KEY NOT NULL,
    amount_minor INTEGER NOT NULL CHECK (amount_minor > 0),
    currency TEXT NOT NULL,
    period TEXT NOT NULL CHECK (period IN ('day', 'week', 'month', 'year')),
    effective_from INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  );
  `,
];

export const SCHEMA_VERSION = MIGRATIONS.length;

export async function migrate(db: Db): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL;');
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version', []);
  const current = row?.user_version ?? 0;

  for (let version = current; version < MIGRATIONS.length; version += 1) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(MIGRATIONS[version]);
      await db.execAsync(`PRAGMA user_version = ${version + 1}`);
    });
  }
}

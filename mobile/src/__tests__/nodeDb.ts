import { DatabaseSync } from 'node:sqlite';

import type { BindValue, Db } from '../data/db';

/** Adapts Node's built-in SQLite to the app's Db interface for tests. */
export function createTestDb(): Db & { close(): void } {
  const sqlite = new DatabaseSync(':memory:');

  return {
    async execAsync(sql) {
      sqlite.exec(sql);
    },
    async runAsync(sql, params: BindValue[]) {
      return sqlite.prepare(sql).run(...params);
    },
    async getAllAsync<T>(sql: string, params: BindValue[]) {
      return sqlite.prepare(sql).all(...params) as T[];
    },
    async getFirstAsync<T>(sql: string, params: BindValue[]) {
      return (sqlite.prepare(sql).get(...params) as T | undefined) ?? null;
    },
    async withTransactionAsync(task) {
      sqlite.exec('BEGIN');
      try {
        await task();
        sqlite.exec('COMMIT');
      } catch (error) {
        sqlite.exec('ROLLBACK');
        throw error;
      }
    },
    close() {
      sqlite.close();
    },
  };
}

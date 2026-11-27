import { describe, expect, it } from 'vitest';

import { appDataReducer, type AppData } from '../state/appDataReducer';
import { at, plan, tx } from './helpers';

const settings = { currency: 'NGN', locale: 'en-NG', weekStart: 1 as const };
const empty: AppData = { status: 'loading', transactions: [], plans: [], settings };

describe('appDataReducer', () => {
  it('becomes ready when data loads', () => {
    const t = tx(100, at(2026, 11, 18));
    const next = appDataReducer(empty, { type: 'loaded', transactions: [t], plans: [], settings });
    expect(next.status).toBe('ready');
    expect(next.transactions).toEqual([t]);
  });

  it('adds new transactions in newest-first order', () => {
    const older = tx(1, at(2026, 11, 17));
    const newer = tx(2, at(2026, 11, 18));
    let state = appDataReducer(empty, { type: 'transaction-saved', transaction: older });
    state = appDataReducer(state, { type: 'transaction-saved', transaction: newer });
    expect(state.transactions.map((t) => t.id)).toEqual([newer.id, older.id]);
  });

  it('replaces an edited transaction instead of duplicating it', () => {
    const t = tx(1, at(2026, 11, 18));
    let state = appDataReducer(empty, { type: 'transaction-saved', transaction: t });
    state = appDataReducer(state, { type: 'transaction-saved', transaction: { ...t, amountMinor: 5 } });
    expect(state.transactions).toHaveLength(1);
    expect(state.transactions[0].amountMinor).toBe(5);
  });

  it('removes transactions and rolls back by saving them again', () => {
    const t = tx(1, at(2026, 11, 18));
    let state = appDataReducer(empty, { type: 'transaction-saved', transaction: t });
    state = appDataReducer(state, { type: 'transaction-removed', id: t.id });
    expect(state.transactions).toEqual([]);
    state = appDataReducer(state, { type: 'transaction-saved', transaction: t });
    expect(state.transactions).toEqual([t]);
  });

  it('clears everything but keeps the app usable', () => {
    const loaded = appDataReducer(empty, {
      type: 'loaded',
      transactions: [tx(1, at(2026, 11, 18))],
      plans: [plan({ effectiveFrom: at(2026, 11, 16, 0) })],
      settings: { ...settings, currency: 'GHS' },
    });
    const cleared = appDataReducer(loaded, { type: 'cleared', settings });
    expect(cleared).toEqual({ status: 'ready', transactions: [], plans: [], settings });
  });
});

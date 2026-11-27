import * as Crypto from 'expo-crypto';
import { getCalendars, getLocales } from 'expo-localization';
import { useSQLiteContext } from 'expo-sqlite';
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import { Appearance, AppState } from 'react-native';

import { addBudgetPlan } from '@/core/budget/plans';
import type { PeriodKind } from '@/core/dates';
import type { Transaction } from '@/core/types';
import type { Db } from '@/data/db';
import { settingsFromDevice } from '@/data/defaults';
import { DEMO_DATA_ENABLED, demoData } from '@/data/demoSeed';
import * as repo from '@/data/repository';
import { forgetRegistration, registerAnonymously, reportDailyOpen } from '@/services/registration';
import { appDataReducer, type AppData } from './appDataReducer';

export interface NewTransaction {
  amountMinor: number;
  categoryId: string;
  note?: string;
}

interface AppDataContextValue extends AppData {
  addTransaction(input: NewTransaction): Promise<Transaction>;
  updateTransaction(t: Transaction): Promise<void>;
  deleteTransaction(id: string): Promise<void>;
  setBudget(amountMinor: number, period: PeriodKind): Promise<void>;
  updateSettings(patch: Partial<repo.Settings>): Promise<void>;
  /** Saves the username and quietly registers an anonymous user. */
  completeUsername(username: string): Promise<void>;
  deleteAllData(): Promise<void>;
  /** When the username step was completed (epoch ms), if known */
  memberSince: number | null;
}

const LAST_DAILY_OPEN = 'lastDailyOpen';
const MEMBER_SINCE = 'memberSince';

const AppDataContext = createContext<AppDataContextValue | null>(null);

function deviceDefaults(): repo.Settings {
  const locale = getLocales()[0];
  const calendar = getCalendars()[0];
  return settingsFromDevice({
    languageTag: locale?.languageTag ?? null,
    currencyCode: locale?.currencyCode ?? null,
    firstWeekday: calendar?.firstWeekday ?? null,
  });
}

/**
 * Owns all persisted app data. Every change updates the screen first
 * (optimistic UI) and is rolled back if the database write fails.
 */
export function AppDataProvider({ children }: { children: ReactNode }) {
  const db: Db = useSQLiteContext();
  const defaults = useMemo(() => deviceDefaults(), []);
  const [state, dispatch] = useReducer(appDataReducer, {
    status: 'loading',
    transactions: [],
    plans: [],
    settings: defaults,
  });
  // Latest state for callbacks, so they stay stable between renders.
  const stateRef = useRef(state);
  useLayoutEffect(() => {
    stateRef.current = state;
  }, [state]);

  const [memberSince, setMemberSince] = useState<number | null>(null);
  useEffect(() => {
    repo.getMeta(db, MEMBER_SINCE).then((v) => setMemberSince(v ? Number(v) : null)).catch(() => undefined);
  }, [db]);

  // Dark mode: 'system' follows the phone; otherwise override the whole app.
  useEffect(() => {
    // Not implemented by react-native-web (browser previews); always present on phones.
    if (typeof Appearance.setColorScheme === 'function') {
      Appearance.setColorScheme(state.settings.theme === 'system' ? 'unspecified' : state.settings.theme);
    }
  }, [state.settings.theme]);

  useEffect(() => {
    const seed = async () => {
      // Preview builds only (EXPO_PUBLIC_DEMO_DATA=1): fill an empty app with a month of entries.
      if (!DEMO_DATA_ENABLED || (await repo.listTransactions(db)).length > 0) return;
      const demo = demoData(Date.now(), defaults.currency);
      for (const t of demo.transactions) await repo.saveTransaction(db, t);
      await repo.replaceBudgetPlans(db, demo.plans);
    };
    seed()
      .then(() => Promise.all([repo.listTransactions(db), repo.listBudgetPlans(db), repo.loadSettings(db, defaults)]))
      .then(([transactions, plans, settings]) => dispatch({ type: 'loaded', transactions, plans, settings }))
      .catch(() => dispatch({ type: 'load-failed' }));
  }, [db, defaults]);

  const addTransaction = useCallback(
    async ({ amountMinor, categoryId, note = '' }: NewTransaction) => {
      const now = Date.now();
      const transaction: Transaction = {
        id: Crypto.randomUUID(),
        amountMinor,
        currency: stateRef.current.settings.currency,
        categoryId,
        note,
        occurredAt: now,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      };
      dispatch({ type: 'transaction-saved', transaction });
      try {
        await repo.saveTransaction(db, transaction);
      } catch (error) {
        dispatch({ type: 'transaction-removed', id: transaction.id });
        throw error;
      }
      return transaction;
    },
    [db],
  );

  const updateTransaction = useCallback(
    async (next: Transaction) => {
      const previous = stateRef.current.transactions.find((t) => t.id === next.id);
      const updated = { ...next, updatedAt: Date.now() };
      dispatch({ type: 'transaction-saved', transaction: updated });
      try {
        await repo.saveTransaction(db, updated);
      } catch (error) {
        if (previous) dispatch({ type: 'transaction-saved', transaction: previous });
        throw error;
      }
    },
    [db],
  );

  const deleteTransaction = useCallback(
    async (id: string) => {
      const previous = stateRef.current.transactions.find((t) => t.id === id);
      dispatch({ type: 'transaction-removed', id });
      try {
        await repo.softDeleteTransaction(db, id, Date.now());
      } catch (error) {
        if (previous) dispatch({ type: 'transaction-saved', transaction: previous });
        throw error;
      }
    },
    [db],
  );

  const setBudget = useCallback(
    async (amountMinor: number, period: PeriodKind) => {
      const { plans: previous, settings } = stateRef.current;
      const plans = addBudgetPlan(previous, {
        id: Crypto.randomUUID(),
        amountMinor,
        currency: settings.currency,
        period,
        now: Date.now(),
        weekStart: settings.weekStart,
      });
      dispatch({ type: 'plans-replaced', plans });
      try {
        await repo.replaceBudgetPlans(db, plans);
      } catch (error) {
        dispatch({ type: 'plans-replaced', plans: previous });
        throw error;
      }
    },
    [db],
  );

  const updateSettings = useCallback(
    async (patch: Partial<repo.Settings>) => {
      const previous = stateRef.current.settings;
      const settings = { ...previous, ...patch };
      dispatch({ type: 'settings-changed', settings });
      try {
        await repo.saveSettings(db, settings);
      } catch (error) {
        dispatch({ type: 'settings-changed', settings: previous });
        throw error;
      }
    },
    [db],
  );

  // Daily active usage: once per local day, on launch and when the app returns to the foreground.
  const reportOpen = useCallback(async () => {
    const last = await repo.getMeta(db, LAST_DAILY_OPEN);
    const reported = await reportDailyOpen(last, Date.now());
    if (reported) await repo.setMeta(db, LAST_DAILY_OPEN, reported);
  }, [db]);

  const registered = state.status === 'ready' && state.settings.username !== null;
  useEffect(() => {
    if (!registered) return;
    reportOpen().catch(() => undefined);
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') reportOpen().catch(() => undefined);
    });
    return () => sub.remove();
  }, [registered, reportOpen]);

  const completeUsername = useCallback(
    async (username: string) => {
      await updateSettings({ username });
      if (memberSince === null) {
        const now = Date.now();
        setMemberSince(now);
        repo.setMeta(db, MEMBER_SINCE, String(now)).catch(() => undefined);
      }
      const { locale, currency } = stateRef.current.settings;
      // Fire and forget: never block the user on the network.
      registerAnonymously({ locale, currency })
        .then((uid) => (uid ? reportOpen() : undefined))
        .catch(() => undefined);
    },
    [updateSettings, reportOpen, memberSince, db],
  );

  const deleteAllData = useCallback(async () => {
    await repo.deleteAllData(db);
    dispatch({ type: 'cleared', settings: defaults });
    setMemberSince(null);
    forgetRegistration().catch(() => undefined);
  }, [db, defaults]);

  const value = useMemo(
    () => ({ ...state, addTransaction, updateTransaction, deleteTransaction, setBudget, updateSettings, completeUsername, deleteAllData, memberSince }),
    [state, addTransaction, updateTransaction, deleteTransaction, setBudget, updateSettings, completeUsername, deleteAllData, memberSince],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const value = useContext(AppDataContext);
  if (!value) throw new Error('useAppData must be used inside <AppDataProvider>');
  return value;
}

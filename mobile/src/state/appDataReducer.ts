import type { BudgetPlan, Transaction } from '../core/types';
import type { Settings } from '../data/repository';

export interface AppData {
  status: 'loading' | 'ready' | 'error';
  transactions: Transaction[];
  plans: BudgetPlan[];
  settings: Settings;
}

export type AppDataAction =
  | { type: 'loaded'; transactions: Transaction[]; plans: BudgetPlan[]; settings: Settings }
  | { type: 'load-failed' }
  | { type: 'transaction-saved'; transaction: Transaction }
  | { type: 'transaction-removed'; id: string }
  | { type: 'plans-replaced'; plans: BudgetPlan[] }
  | { type: 'settings-changed'; settings: Settings }
  | { type: 'cleared'; settings: Settings };

const byNewest = (a: Transaction, b: Transaction) => b.occurredAt - a.occurredAt || b.createdAt - a.createdAt;

export function appDataReducer(state: AppData, action: AppDataAction): AppData {
  switch (action.type) {
    case 'loaded':
      return { status: 'ready', transactions: action.transactions, plans: action.plans, settings: action.settings };
    case 'load-failed':
      return { ...state, status: 'error' };
    case 'transaction-saved': {
      const others = state.transactions.filter((t) => t.id !== action.transaction.id);
      const transactions = action.transaction.deletedAt === null ? [...others, action.transaction] : others;
      return { ...state, transactions: transactions.sort(byNewest) };
    }
    case 'transaction-removed':
      return { ...state, transactions: state.transactions.filter((t) => t.id !== action.id) };
    case 'plans-replaced':
      return { ...state, plans: action.plans };
    case 'settings-changed':
      return { ...state, settings: action.settings };
    case 'cleared':
      return { ...state, transactions: [], plans: [], settings: action.settings };
  }
}

import { useState, useCallback } from 'react';
import type { Budget, BudgetPeriod } from '../types/budget';

const STORAGE_KEY = 'gofinancial_budget';

function loadBudget(): Budget | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as Budget;
    }
  } catch {
    // ignore
  }
  return null;
}

function saveBudget(budget: Budget): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(budget));
}

export function clearBudget(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export interface UseBudgetReturn {
  budget: Budget | null;
  setBudget: (amount: number, period: BudgetPeriod) => void;
  clearBudget: () => void;
}

export function useBudget(): UseBudgetReturn {
  const [budget, setBudgetState] = useState<Budget | null>(loadBudget);

  const setBudget = useCallback((amount: number, period: BudgetPeriod) => {
    const newBudget: Budget = {
      amount,
      period,
      createdAt: budget?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
    setBudgetState(newBudget);
    saveBudget(newBudget);
  }, [budget]);

  const clear = useCallback(() => {
    setBudgetState(null);
    clearBudget();
  }, []);

  return { budget, setBudget, clearBudget: clear };
}

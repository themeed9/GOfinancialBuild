import { useState, useEffect, useCallback } from 'react';
import type { Transaction } from '../types';
import * as storage from '../services/storage';

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storage.getTransactions()
      .then(setTransactions)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const addTransaction = useCallback(async (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev]);
    try {
      await storage.addTransaction(transaction);
    } catch {
      setTransactions(prev => prev.filter(t => t.id !== transaction.id));
    }
  }, []);

  const deleteTransaction = useCallback(async (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    try {
      await storage.deleteTransaction(id);
    } catch {
      setTransactions(prev => {
        const tx = prev.find(t => t.id === id);
        return tx ? [...prev, tx] : prev;
      });
    }
  }, []);

  const updateTransaction = useCallback(async (transaction: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === transaction.id ? transaction : t));
    try {
      await storage.updateTransaction(transaction);
    } catch {
      // Revert if failed
      const original = await storage.getTransactions();
      setTransactions(original);
    }
  }, []);

  return { transactions, loading, addTransaction, deleteTransaction, updateTransaction };
}

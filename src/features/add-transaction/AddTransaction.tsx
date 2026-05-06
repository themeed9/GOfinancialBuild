import { useState, useEffect, type FormEvent } from 'react';
import type { Transaction, Category } from '../../types';
import styles from './AddTransaction.module.css';
import { getCurrencyCodeFromSymbol } from '../../utils/currency';

interface AddTransactionProps {
  categories: Category[];
  currencySymbol?: string;
  onSave: (transaction: Transaction) => void;
  onCancel: () => void;
}

function generateId(): string {
  return `txn_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export default function AddTransaction({ categories, onSave, onCancel }: AddTransactionProps) {
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState(() => {
    const saved = localStorage.getItem('gofinancial_currency');
    if (saved) {
      const data = JSON.parse(saved);
      return data.symbol || '$';
    }
    return '$';
  });

  // Update currency symbol when modal opens (in case user changed country)
  useEffect(() => {
    const saved = localStorage.getItem('gofinancial_currency');
    if (saved) {
      const data = JSON.parse(saved);
      setCurrencySymbol(data.symbol || '$');
    }
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount)) {
      setError('Please enter a valid amount');
      return;
    }
    if (numAmount <= 0) {
      setError('Amount must be greater than zero');
      return;
    }
    if (!categoryId) {
      setError('Please select a category');
      return;
    }

  const originalCurrency = getCurrencyCodeFromSymbol(currencySymbol);

    const transaction: Transaction = {
      id: generateId(),
      amount: numAmount,
      categoryId,
      note: note.trim(),
      timestamp: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      originalCurrency,
    };

    onSave(transaction);
  }

  return (
    <div className={styles.overlay} role="dialog" aria-label="Add transaction">
      <form className={styles.sheet} onSubmit={handleSubmit}>
        <div className={styles.header}>
          <h2 className={styles.title}>New Expense</h2>
          <button
            type="button"
            className={styles.close}
            onClick={onCancel}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className={styles.amountContainer}>
          <span className={styles.currencySymbol}>{currencySymbol}</span>
          <input
            id="amount"
            type="number"
            inputMode="decimal"
            className={styles.amountInput}
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0"
            step="0.01"
            min="0"
            autoFocus
            aria-describedby={error ? 'form-error' : undefined}
          />
        </div>

        <div className={styles.field}>
          <span className={styles.label} id="category-label">Category</span>
          <div
            className={styles.categories}
            role="radiogroup"
            aria-labelledby="category-label"
          >
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                className={`${styles.category} ${categoryId === cat.id ? styles.categorySelected : ''}`}
                onClick={() => setCategoryId(cat.id)}
                role="radio"
                aria-checked={categoryId === cat.id}
                aria-label={cat.name}
              >
                <span className={styles.categoryIcon}>{cat.icon}</span>
                <span className={styles.categoryName}>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="note" className={styles.label}>Note (optional)</label>
          <input
            id="note"
            type="text"
            className={styles.input}
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="What was this for?"
            maxLength={100}
          />
        </div>

        {error && (
          <div id="form-error" className={styles.error} role="alert">
            {error}
          </div>
        )}

        <button type="submit" className={styles.submit}>
          Save Transaction
        </button>
      </form>
    </div>
  );
}

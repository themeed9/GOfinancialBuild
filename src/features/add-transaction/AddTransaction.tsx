import { useState, type FormEvent } from 'react';
import type { Transaction, Category } from '../../types';
import type { CurrencyOption } from '../../data/currencies';
import styles from './AddTransaction.module.css';
import { getCurrencyISOCode } from '../../data/currencies';
import { useI18n } from '../../hooks/useI18n';
import { MdErrorOutline } from 'react-icons/md';

interface AddTransactionProps {
  categories: Category[];
  currency: CurrencyOption;
  onSave: (transaction: Transaction) => void;
  onCancel: () => void;
  defaultTimestamp?: number;
}

function generateId(): string {
  return `txn_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export default function AddTransaction({ categories, currency, onSave, onCancel, defaultTimestamp }: AddTransactionProps) {
  const { strings } = useI18n();
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount)) {
      setError(strings.error_valid_amount);
      return;
    }
    if (numAmount <= 0) {
      setError(strings.error_amount_positive);
      return;
    }
    if (!categoryId) {
      setError(strings.error_select_category);
      return;
    }

    if (!note.trim()) {
      setError(strings.error_enter_description);
      return;
    }

    const finalNote = note.trim();

    const originalCurrency = getCurrencyISOCode(currency);

    const now = defaultTimestamp ?? Date.now();
    const transaction: Transaction = {
      id: generateId(),
      amount: numAmount,
      categoryId,
      note: sanitizeInput(finalNote),
      timestamp: now,
      createdAt: now,
      updatedAt: now,
      originalCurrency,
    };

    onSave(transaction);
  }

  return (
    <div className={styles.overlay} role="dialog" aria-label="Add transaction">
      <form className={styles.sheet} onSubmit={handleSubmit}>
        <div className={styles.header}>
          <h2 className={styles.title}>{strings.new_expense}</h2>
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
          <span className={styles.currencySymbol}>{currency.symbol}</span>
          <input
            id="amount"
            type="number"
            inputMode="decimal"
            className={styles.amountInput}
            value={amount}
            onChange={e => {
              setAmount(e.target.value);
              if (error) setError('');
            }}
            placeholder="0"
            step="0.01"
            min="0"
            autoFocus
            aria-describedby={error ? 'form-error' : undefined}
          />
        </div>

        <div className={styles.field}>
          <span className={styles.label} id="category-label">{strings.category}</span>
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
          <label htmlFor="note" className={styles.label}>{strings.description}</label>
          <div className={styles.inputWrapper}>
            <input
              id="note"
              type="text"
              className={styles.input}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={strings.description_placeholder}
              maxLength={100}
              autoComplete="off"
            />
          </div>
        </div>

        {error && (
          <div id="form-error" className={styles.error} role="alert">
            <MdErrorOutline size={16} /><span>{error}</span>
          </div>
        )}

        <button 
          type="submit" 
          className={`${styles.submit} ${(!amount || !categoryId || !note.trim()) ? styles.submitDisabled : ''}`}
          disabled={!amount || !categoryId || !note.trim()}
        >
          {strings.save_transaction}
        </button>
      </form>
    </div>
  );
}

function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .slice(0, 100);
}

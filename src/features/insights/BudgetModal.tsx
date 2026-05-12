import { useState, useCallback, useEffect } from 'react';
import type { Budget, BudgetPeriod } from '../../types/budget';
import type { CurrencyOption } from '../../data/currencies';
import { MdClose, MdErrorOutline } from 'react-icons/md';
import styles from './BudgetModal.module.css';

interface BudgetModalProps {
  budget: Budget | null;
  currency: CurrencyOption;
  onSave: (amount: number, period: BudgetPeriod) => void;
  onClear?: () => void;
  onClose: () => void;
}

const PERIOD_LABELS: Record<BudgetPeriod, { label: string; hint: string }> = {
  day: { label: 'Daily', hint: 'per day' },
  week: { label: 'Weekly', hint: 'per week' },
  month: { label: 'Monthly', hint: 'per month' },
  year: { label: 'Yearly', hint: 'per year' },
};

export default function BudgetModal({ budget, currency, onSave, onClear, onClose }: BudgetModalProps) {
  const [amount, setAmount] = useState(budget ? String(budget.amount) : '');
  const [period, setPeriod] = useState<BudgetPeriod>(budget?.period ?? 'month');
  const [error, setError] = useState('');

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSave = useCallback(() => {
    const num = parseFloat(amount.replace(/,/g, ''));
    if (!amount || isNaN(num) || num <= 0) {
      setError('Please enter a valid amount greater than zero.');
      return;
    }
    onSave(num, period);
    onClose();
  }, [amount, period, onSave, onClose]);

  const handleClear = useCallback(() => {
    onClear?.();
    onClose();
  }, [onClear, onClose]);

  const isValid = parseFloat(amount) > 0;

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-label="Set budget">
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{budget ? 'Adjust Budget' : 'Set a Budget'}</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            <MdClose size={22} />
          </button>
        </div>

        {/* Amount */}
        <div className={styles.amountSection}>
          <span className={styles.amountLabel}>Budget amount</span>
          <div className={styles.amountInputWrapper}>
            <span className={styles.currencySymbol}>{currency.symbol}</span>
            <input
              className={styles.amountInput}
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              placeholder="0"
              value={amount}
              onChange={e => { setAmount(e.target.value); setError(''); }}
              autoFocus
              aria-label="Budget amount"
              aria-describedby={error ? 'budget-error' : undefined}
            />
          </div>
          {error && <p id="budget-error" className={styles.errorText}><MdErrorOutline size={14} /> {error}</p>}
        </div>

        {/* Period */}
        <div className={styles.periodSection}>
          <span className={styles.periodLabel}>Reset period</span>
          <div className={styles.periodGrid} role="radiogroup" aria-label="Budget period">
            {(Object.entries(PERIOD_LABELS) as [BudgetPeriod, { label: string; hint: string }][]).map(([p, { label, hint }]) => (
              <button
                key={p}
                className={`${styles.periodBtn} ${period === p ? styles.periodBtnActive : ''}`}
                onClick={() => setPeriod(p)}
                role="radio"
                aria-checked={period === p}
              >
                {label}
                <span className={styles.periodBtnHint}>{hint}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            className={`${styles.saveBtn} ${!isValid ? styles.saveBtnDisabled : ''}`}
            onClick={handleSave}
            disabled={!isValid}
          >
            {budget ? 'Update Budget' : 'Set Budget'}
          </button>
          {budget && onClear && (
            <button className={styles.clearBtn} onClick={handleClear}>
              Remove budget
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

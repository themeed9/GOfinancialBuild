import { useState, useCallback } from 'react';
import type { BudgetPeriod } from '../../types/budget';
import styles from './BudgetSetup.module.css';

interface BudgetSetupProps {
  onComplete: (amount: number, period: BudgetPeriod) => void;
  onSkip: () => void;
}

const PERIODS: { key: BudgetPeriod; label: string }[] = [
  { key: 'day', label: 'Daily' },
  { key: 'week', label: 'Weekly' },
  { key: 'month', label: 'Monthly' },
  { key: 'year', label: 'Yearly' },
];

export default function BudgetSetup({ onComplete, onSkip }: BudgetSetupProps) {
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<BudgetPeriod>('month');
  const [error, setError] = useState('');

  const handleContinue = useCallback(() => {
    const num = parseFloat(amount);
    if (!amount || isNaN(num) || num <= 0) {
      setError('Enter a valid budget amount');
      return;
    }
    onComplete(num, period);
  }, [amount, period, onComplete]);

  return (
    <div className={styles.container}>
      <div className={styles.topContent}>
        <h1 className={styles.title}>Set Your Budget</h1>
        <p className={styles.subtitle}>
          Track your spending against a budget and see your pulse rate improve
        </p>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.inputCard}>
          <label className={styles.inputLabel} htmlFor="budget-amount">
            Budget amount
          </label>
          <div className={styles.inputWrapper}>
            <span className={styles.currencySign}>₦</span>
            <input
              id="budget-amount"
              className={styles.amountInput}
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={e => { setAmount(e.target.value); setError(''); }}
              autoFocus
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
        </div>

        <p className={styles.periodLabel}>This is my budget for:</p>
        <div className={styles.periodGrid}>
          {PERIODS.map(p => (
            <button
              key={p.key}
              className={`${styles.periodBtn} ${period === p.key ? styles.periodBtnActive : ''}`}
              onClick={() => setPeriod(p.key)}
              aria-pressed={period === p.key}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.footer}>
        <button className={styles.skipBtn} onClick={onSkip}>
          Skip
        </button>
        <button className={styles.continueBtn} onClick={handleContinue}>
          Continue
        </button>
      </div>
    </div>
  );
}

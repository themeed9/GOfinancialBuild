import { useState, useMemo, useCallback } from 'react';
import type { Transaction, Category } from '../../types';
import type { CurrencyOption } from '../../data/currencies';
import { getCurrencyISOCode } from '../../data/currencies';
import EditTransactionModal from './EditTransactionModal';
import styles from './TransactionList.module.css';
import { MdEdit, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { convertCurrency, getCurrencySymbol } from '../../utils/currency';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onDelete: (id: string) => void;
  onUpdate: (transaction: Transaction) => void;
  currency: CurrencyOption;
  viewMode?: 'dashboard' | 'history';
  onSwitchToHistory?: (date: Date) => void;
  syncDate?: Date | null;
}

function formatCurrency(amount: number, symbol: string, originalCurrency: string | undefined, currency: CurrencyOption): string {
  const targetISO = getCurrencyISOCode(currency);
  const fromCurrency = originalCurrency || targetISO;
  const convertedAmount = convertCurrency(amount, fromCurrency, currency);

  const locale = import.meta.env.VITE_DEFAULT_LOCALE || 'en-NG';
  const formattedNumber = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(convertedAmount);

  return `${symbol}${formattedNumber}`;
}

function isConverted(originalCurrency: string | undefined, currency: CurrencyOption): boolean {
  if (!originalCurrency) return false;
  return originalCurrency !== getCurrencyISOCode(currency);
}

function formatShortDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).replace(/ /g, '-').replace(',', '');
}

export default function TransactionList({ transactions, categories, onDelete, onUpdate, currency, viewMode = 'history', onSwitchToHistory, syncDate }: TransactionListProps) {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedDate, setSelectedDate] = useState(syncDate || new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [showLimitNotice, setShowLimitNotice] = useState(false);

  const today = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const minDate = useMemo(() => {
    if (viewMode === 'dashboard') {
      const date = new Date(today);
      date.setDate(date.getDate() - 3);
      date.setHours(0, 0, 0, 0);
      return date;
    }
    return new Date(2000, 0, 1); // No limit on history page
  }, [today, viewMode]);

  const selectedDayStart = useMemo(() => {
    const date = new Date(selectedDate);
    date.setHours(0, 0, 0, 0);
    return date;
  }, [selectedDate]);

  const selectedDayEnd = useMemo(() => {
    const date = new Date(selectedDate);
    date.setHours(23, 59, 59, 999);
    return date;
  }, [selectedDate]);

  const dayTransactions = useMemo(() => {
    return transactions.filter(t => {
      const tDate = new Date(t.timestamp);
      return tDate >= selectedDayStart && tDate <= selectedDayEnd;
    });
  }, [transactions, selectedDayStart, selectedDayEnd]);

  const sorted = useMemo(() => {
    return [...dayTransactions].sort((a, b) => b.timestamp - a.timestamp);
  }, [dayTransactions]);

  const isToday = selectedDayStart.getTime() === today.getTime();

  const goToPreviousDay = useCallback(() => {
    if (viewMode === 'dashboard' && selectedDayStart.getTime() <= minDate.getTime()) {
      setShowLimitNotice(true);
      setTimeout(() => setShowLimitNotice(false), 3000);
      return;
    }
    setSelectedDate(prev => {
      const date = new Date(prev);
      date.setDate(date.getDate() - 1);
      return date;
    });
  }, [viewMode, selectedDayStart, minDate]);

  const goToNextDay = useCallback(() => {
    if (isToday) return;
    setSelectedDate(prev => {
      const date = new Date(prev);
      date.setDate(date.getDate() + 1);
      return date;
    });
  }, [isToday]);

  const dateStr = formatShortDate(selectedDate.getTime());

  const [calendarDate, setCalendarDate] = useState(new Date(selectedDate));

  const handleDateClick = useCallback(() => {
    setCalendarDate(new Date(selectedDate));
    setShowCalendar(prev => !prev);
  }, [selectedDate]);

  const handlePrevMonth = useCallback(() => {
    setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCalendarDate(prev => {
      const next = new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
      if (next <= today) {
        return next;
      }
      return prev;
    });
  }, [today]);

  const handlePrevYear = useCallback(() => {
    setCalendarDate(prev => new Date(prev.getFullYear() - 1, prev.getMonth(), 1));
  }, []);

  const handleNextYear = useCallback(() => {
    setCalendarDate(prev => {
      const next = new Date(prev.getFullYear() + 1, prev.getMonth(), 1);
      if (next <= today) {
        return next;
      }
      return prev;
    });
  }, [today]);

  const handleDayClick = useCallback((day: number) => {
    setCalendarDate(prev => {
      const newDate = new Date(prev.getFullYear(), prev.getMonth(), day);
      if (newDate <= today) {
        if (viewMode === 'dashboard' && newDate < minDate) {
          onSwitchToHistory?.(newDate);
          return prev;
        }
        setSelectedDate(newDate);
        setShowCalendar(false);
      }
      return prev;
    });
  }, [today, viewMode, minDate, onSwitchToHistory]);

  const calendarDays = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(d);
    }
    return days;
  }, [calendarDate]);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const handleEdit = useCallback((transaction: Transaction) => {
    setEditingTransaction(transaction);
  }, []);

  return (
      <section className={styles.listContainer} aria-label="Transaction history">
        <h2 className={`${styles.historyTitle} ${viewMode === 'history' ? styles.titleHistory : ''}`}>{viewMode === 'dashboard' ? "Today's Expenses" : 'Expense History'}</h2>
        {showLimitNotice && <div className={styles.limitNotice}>Go to History to view older expenses</div>}
        <div className={styles.listHeader}>
          <div className={styles.dateGroup}>
            <button
              className={styles.chevronLeft}
              onClick={goToPreviousDay}
              aria-label="Previous day"
            >
              <MdChevronLeft size={16} />
            </button>
            <button className={styles.dateText} onClick={handleDateClick}>
              {dateStr}
            </button>
            <button
              className={`${styles.chevronRight} ${isToday ? styles.disabled : ''}`}
              onClick={goToNextDay}
              disabled={isToday}
              aria-label="Next day"
            >
              <MdChevronRight size={16} />
            </button>
          </div>
        </div>

      {showCalendar && (
        <div className={styles.calendarOverlay} onClick={() => setShowCalendar(false)}>
          <div className={styles.calendarModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.calendarHeader}>
              <button onClick={handlePrevYear} className={styles.calendarNav} aria-label="Previous year">«</button>
              <button onClick={handlePrevMonth} className={styles.calendarNav} aria-label="Previous month">‹</button>
              <span className={styles.calendarTitle}>{monthNames[calendarDate.getMonth()]} {calendarDate.getFullYear()}</span>
              <button onClick={handleNextMonth} className={styles.calendarNav} disabled={new Date(calendarDate.getFullYear(), calendarDate.getMonth() +1, 1) > today} aria-label="Next month">›</button>
              <button onClick={handleNextYear} className={styles.calendarNav} disabled={new Date(calendarDate.getFullYear() +1, calendarDate.getMonth(), 1) > today} aria-label="Next year">»</button>
            </div>
            <div className={styles.calendarGrid}>
              <span className={styles.calendarDay}>Su</span>
              <span className={styles.calendarDay}>Mo</span>
              <span className={styles.calendarDay}>Tu</span>
              <span className={styles.calendarDay}>We</span>
              <span className={styles.calendarDay}>Th</span>
              <span className={styles.calendarDay}>Fr</span>
              <span className={styles.calendarDay}>Sa</span>
              {calendarDays.map((day, idx) => (
                day ? (
                  <button
                    key={idx}
                    className={`${styles.calendarDate} ${day === selectedDate.getDate() && calendarDate.getMonth() === selectedDate.getMonth() && calendarDate.getFullYear() === selectedDate.getFullYear() ? styles.calendarDateSelected : ''}`}
                    onClick={() => handleDayClick(day)}
                  >
                    {day}
                  </button>
                ) : (
                  <span key={idx} className={styles.calendarEmpty}></span>
                )
              ))}
            </div>
          </div>
      </div>
        )}

        {sorted.length === 0 ? (
          <p className={styles.emptyDay}>No entry for this day</p>
        ) : (
          <>
            <div className={styles.list}>
              {sorted.map(transaction => {
                const category = categories.find(c => c.id === transaction.categoryId);
                return (
                  <article key={transaction.id} className={styles.item}>
                    <div
                      className={styles.itemContent}
                      onClick={() => handleEdit(transaction)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Edit transaction: ${transaction.note || category?.name || 'Expense'}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleEdit(transaction);
                        }
                      }}
                    >
                      <div className={styles.itemMain}>
                        <span className={styles.itemIcon} aria-hidden="true">
                          {category?.icon || '📦'}
                        </span>
                        <span className={styles.itemCategory}>
                          {transaction.note || category?.name || 'Expense'}
                        </span>
                      </div>
                      <div className={styles.itemAmountContainer}>
                        <span className={styles.itemAmount}>
                          {formatCurrency(transaction.amount, currency.symbol, transaction.originalCurrency, currency)}
                        </span>
                        {isConverted(transaction.originalCurrency, currency) && (
                          <span className={styles.convertedFrom} aria-label="Converted from original currency">
                            Converted from {getCurrencySymbol(transaction.originalCurrency!)}
                          </span>
                        )}
                      </div>
                          <div className={styles.editButton} aria-hidden="true">
                            <MdEdit size={16} />
                          </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {editingTransaction && (
              <EditTransactionModal
                transaction={editingTransaction}
                categories={categories}
                onClose={() => setEditingTransaction(null)}
                onSave={(_, updates) => {
                  onUpdate({ ...editingTransaction!, ...updates });
                  setEditingTransaction(null);
                }}
                onDelete={() => {
                  onDelete(editingTransaction!.id);
                  setEditingTransaction(null);
                }}
              />
            )}
          </>
        )}
      </section>
  );
}

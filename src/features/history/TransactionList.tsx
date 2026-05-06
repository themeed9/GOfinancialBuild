import { useState, useMemo, useEffect } from 'react';
import type { Transaction, Category } from '../../types';
import EditTransactionModal from './EditTransactionModal';
import styles from './TransactionList.module.css';
import { MdEdit, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { convertCurrency } from '../../utils/currency';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onDelete: (id: string) => void;
  onUpdate: (transaction: Transaction) => void;
  currencySymbol: string;
}

function getSelectedCurrency(): string {
  const saved = localStorage.getItem('gofinancial_currency');
  if (saved) {
    try {
      const data = JSON.parse(saved);
      return data.currency || 'NGN';
    } catch {
      return 'NGN';
    }
  }
  return 'NGN';
}

function formatCurrency(amount: number, symbol: string, originalCurrency: string | undefined): string {
  const targetCurrency = getSelectedCurrency();
  const fromCurrency = originalCurrency || targetCurrency;
  const convertedAmount = convertCurrency(amount, fromCurrency, targetCurrency);
  
  const locale = import.meta.env.VITE_DEFAULT_LOCALE || 'en-NG';
  const formattedNumber = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(convertedAmount);
  
  return `${symbol}${formattedNumber}`;
}

function formatShortDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).replace(/ /g, '-').replace(',', '');
}

export default function TransactionList({ transactions, categories, onDelete, onUpdate, currencySymbol }: TransactionListProps) {
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(getSelectedCurrency());

  useEffect(() => {
    const handleStorageChange = () => {
      setSelectedCurrency(getSelectedCurrency());
    };
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(() => {
      const current = getSelectedCurrency();
      if (current !== selectedCurrency) {
        setSelectedCurrency(current);
      }
    }, 500);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [selectedCurrency]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDayStart = new Date(selectedDate);
  selectedDayStart.setHours(0, 0, 0, 0);
  const selectedDayEnd = new Date(selectedDate);
  selectedDayEnd.setHours(23, 59, 59, 999);

  const dayTransactions = transactions.filter(t => {
    const tDate = new Date(t.timestamp);
    return tDate >= selectedDayStart && tDate <= selectedDayEnd;
  });

  const sorted = [...dayTransactions].sort((a, b) => b.timestamp - a.timestamp);
  const isToday = selectedDayStart.getTime() === today.getTime();

  const goToPreviousDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const goToNextDay = () => {
    if (isToday) return;
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const dateStr = formatShortDate(selectedDate.getTime());

  const [calendarDate, setCalendarDate] = useState(new Date(selectedDate));

  const handleDateClick = () => {
    setCalendarDate(new Date(selectedDate));
    setShowCalendar(!showCalendar);
  };

  const handlePrevMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    const next = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1);
    if (next <= today) {
      setCalendarDate(next);
    }
  };

  const handlePrevYear = () => {
    setCalendarDate(new Date(calendarDate.getFullYear() - 1, calendarDate.getMonth(), 1));
  };

  const handleNextYear = () => {
    const next = new Date(calendarDate.getFullYear() + 1, calendarDate.getMonth(), 1);
    if (next <= today) {
      setCalendarDate(next);
    }
  };

  const handleDayClick = (day: number) => {
    const newDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
    if (newDate <= today) {
      setSelectedDate(newDate);
      setShowCalendar(false);
    }
  };

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

  return (
      <section className={styles.listContainer} aria-label="Transaction history">
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
              <button onClick={handlePrevYear} className={styles.calendarNav}>«</button>
              <button onClick={handlePrevMonth} className={styles.calendarNav}>‹</button>
              <span className={styles.calendarTitle}>{monthNames[calendarDate.getMonth()]} {calendarDate.getFullYear()}</span>
              <button onClick={handleNextMonth} className={styles.calendarNav} disabled={new Date(calendarDate.getFullYear(), calendarDate.getMonth() +1, 1) > today}>›</button>
              <button onClick={handleNextYear} className={styles.calendarNav} disabled={new Date(calendarDate.getFullYear() +1, calendarDate.getMonth(), 1) > today}>»</button>
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
                      onClick={() => setEditingTransaction(transaction)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Edit transaction: ${transaction.note || category?.name || 'Expense'}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setEditingTransaction(transaction);
                        }
                      }}
                    >
                      <div className={styles.itemMain}>
                        <span className={styles.itemIcon} aria-hidden="true">
                          {category?.icon || '📦'}
                        </span>
                        <span className={styles.itemCategory}>
                          {transaction.note || category?.name || 'Transport to Ketu'}
                        </span>
                      </div>
                      <div className={styles.itemRight}>
                        <span className={styles.itemAmount}>
                          {formatCurrency(transaction.amount, currencySymbol, transaction.originalCurrency)}
                        </span>
                        <div className={styles.editButton} aria-hidden="true">
                          <MdEdit size={14} />
                        </div>
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

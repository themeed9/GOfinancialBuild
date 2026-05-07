import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { Transaction, User } from '../../types';
import type { CurrencyOption } from '../../data/currencies';
import { getCurrencies, getCurrencyISOCode } from '../../data/currencies';
import ProfileModal from './ProfileModal';
import SettingsModal from './SettingsModal';
import styles from './Dashboard.module.css';
import { MdExpandMore, MdPerson } from 'react-icons/md';
import { convertCurrency, getCurrencySymbol } from '../../utils/currency';

interface DashboardProps {
  transactions: Transaction[];
  currency: CurrencyOption;
  onCurrencyChange: (currency: CurrencyOption) => void;
}

export default function Dashboard({ transactions, currency, onCurrencyChange }: DashboardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('gofinancial_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fall through to default
      }
    }
    const newUser: User = {
      id: crypto.randomUUID(),
      username: 'Meed',
      fullName: null,
      email: null,
      profileImage: null,
      currency: currency.code,
      locale: 'en-NG',
      theme: 'light',
      createdAt: Date.now(),
    };
    localStorage.setItem('gofinancial_user', JSON.stringify(newUser));
    return newUser;
  });

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('gofinancial_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSettingsClick = useCallback(() => {
    setShowSettings(true);
  }, []);

  const targetISO = useMemo(() => getCurrencyISOCode(currency), [currency]);

  const total = useMemo(() => {
    return transactions.reduce((sum, t) => {
      const fromCurrency = t.originalCurrency || targetISO;
      const converted = convertCurrency(t.amount, fromCurrency, currency);
      return sum + converted;
    }, 0);
  }, [transactions, targetISO, currency]);

  const hasMixedCurrencies = useMemo(() => {
    return transactions.some(t => t.originalCurrency && t.originalCurrency !== targetISO);
  }, [transactions, targetISO]);

  const originalCurrencies = useMemo(() => {
    const symbols = new Set<string>();
    transactions.forEach(t => {
      if (t.originalCurrency) {
        symbols.add(getCurrencySymbol(t.originalCurrency));
      }
    });
    return Array.from(symbols);
  }, [transactions]);

  const displayAmount = useMemo(() => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(total);
  }, [total]);

  const [whole, cents] = displayAmount.split('.');

  return (
      <header className={styles.dashboard}>
        <div className={styles.topBar}>
          <button className={styles.profilePill} aria-label="Profile" onClick={(e) => {
            e.stopPropagation();
            setShowProfile(true);
          }}>
            <div className={styles.avatar}>
              {user.profileImage ? (
                <img src={user.profileImage} alt="Profile" className={styles.profileAvatarImg} />
              ) : (
                <MdPerson size={20} color="var(--color-on-secondary-container)" style={{ marginTop: '2px', marginLeft: '1px' }} />
              )}
            </div>
            <span className={styles.profileName}>{user.username}</span>
          </button>
          <button className={styles.appIcon} aria-label="App menu" onClick={handleSettingsClick}>
            <span className={styles.appLogo}>≈</span>
          </button>
        </div>

      <div className={styles.balanceSection}>
        <div className={styles.countrySelector} ref={dropdownRef}>
          <button
            className={styles.dropdownToggle}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            aria-label="Select currency"
            aria-expanded={isOpen}
          >
            <FlagImage code={currency.code} />
            <span>{currency.countryHint}</span>
            <MdExpandMore size={20} className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} />
          </button>
          {isOpen && (
            <div className={styles.dropdown}>
              <CurrencyList
                currentCode={currency.code}
                onSelect={(c) => {
                  onCurrencyChange(c);
                  setIsOpen(false);
                }}
              />
            </div>
          )}
        </div>

        <span className={styles.balanceLabel}>Total amount spent today</span>
        <div className={styles.balanceAmount}>
          <span className={styles.currencyCode}>{currency.symbol}</span>
          <span className={styles.wholeAmount}>{whole}</span>
          <span className={styles.cents}>.{cents}</span>
        </div>
        {hasMixedCurrencies && (
          <span className={styles.convertedLabel} aria-label={`Converted from ${originalCurrencies.join(', ')}`}>
            converted from {originalCurrencies.join(', ')}
          </span>
        )}
      </div>

      {showProfile && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfile(false)}
          onUpdateUser={updateUser}
        />
      )}

      {showSettings && (
        <SettingsModal
          user={user}
          onClose={() => setShowSettings(false)}
          onUpdateUser={updateUser}
        />
      )}
    </header>
  );
}

function FlagImage({ code }: { code: string }) {
  const [error, setError] = useState(false);

  if (error) {
    return <span className={styles.flagFallback}>{code.toUpperCase()}</span>;
  }

  return (
    <img
      src={`https://flagcdn.com/w80/${code}.png`}
      alt=""
      className={styles.flagImage}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}

function CurrencyList({ currentCode, onSelect }: { currentCode: string; onSelect: (c: CurrencyOption) => void }) {
  const currencies = getCurrencies();

  return (
    <>
      {currencies.map(c => (
        <div
          key={c.code}
          className={styles.dropdownItem}
          onClick={() => onSelect(c)}
          role="option"
          aria-selected={c.code === currentCode}
        >
          <FlagImage code={c.code} />
          <span>{c.countryHint}</span>
        </div>
      ))}
    </>
  );
}

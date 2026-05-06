import { useState, useRef, useEffect } from 'react';
import type { Transaction, User } from '../../types';
import ProfileModal from './ProfileModal';
import SettingsModal from './SettingsModal';
import styles from './Dashboard.module.css';
import { MdExpandMore, MdPerson } from 'react-icons/md';
import { convertCurrency, getCurrencySymbol } from '../../utils/currency';

const TRANSLATIONS: Record<string, string> = {
  'fr': 'Montant total dépensé aujourd\'hui',
  'es': 'Total gastado hoy',
  'us': 'Total amount spent today',
  'cn': '今日支出总额',
  'it': 'Totale speso oggi',
  'tr': 'Bugün harcanan toplam tutar',
  'mx': 'Total gastado hoy',
  'th': 'ยอดรวมที่ใช้จ่ายวันนี้',
  'de': 'Heute ausgegebener Gesamtbetrag',
  'gb': 'Total amount spent today',
  'jp': '今日の支出合計',
  'gr': 'Συνολικό ποσό που δαπανήθηκε σήμερα',
  'au': 'Total amount spent today',
  'ca': 'Total amount spent today',
  'ch': 'Total dépensé aujourd\'hui',
  'in': 'आज खर्च की गई कुल राशि',
  'br': 'Total gasto hoje',
  'kr': '오늘 사용한 총 금액',
  'ru': 'Общая сумма, потраченная сегодня',
  'za': 'Total amount spent today',
  'ae': 'إجمالي المبلغ المنفق اليوم',
  'sa': 'إجمالي المبلغ المنفق اليوم',
  'sg': 'Total amount spent today',
  'hk': '今日支出總額',
  'tw': '今日支出總額',
  'se': 'Total amount spent today',
  'no': 'Total amount spent today',
  'dk': 'Total amount spent today',
  'pl': 'Łączna kwota wydana dzisiaj',
  'id': 'Total jumlah yang dihabiskan hari ini',
  'my': 'Jumlah jumlah yang dibelanjakan hari ini',
  'ph': 'Kabuuang na ginastos nga yamang karon',
  'vn': 'Tổng số tiền chi tiêu hôm nay',
  'eg': 'إجمالي المبلغ المنفق اليوم',
  'ng': 'Total amount spent today',
  'ke': 'Jumla ya pesa iliyotumika leo',
  'gh': 'Total amount spent today',
  'tz': 'Jumla ya pesa iliyotumika leo',
  'ug': 'Total amount spent today',
  'ma': 'إجمالي المبلغ المنفق اليوم',
  'tn': 'إجمالي المبلغ المنفق اليوم',
  'ar': 'Total gastado hoy',
  'cl': 'Total gastado hoy',
  'co': 'Total gastado hoy',
  'pe': 'Total gastado hoy',
  'nz': 'Total amount spent today',
  'il': 'סכום כולל שנוצא היום',
  'cz': 'Celková částka vydaná dnes',
  'hu': 'Ma elköltött teljes összeg',
  'ro': 'Suma totală cheltuită astăzi',
  'bg': 'Обща сума, похарчена днес',
  'hr': 'Ukupno potrošeno danas',
  'is': 'Heildarupphæð eydd í dag',
  'ua': 'Загальна сума, витрачена сьогодні',
};

interface DashboardProps {
  transactions: Transaction[];
  onCurrencyChange: (symbol: string) => void;
}

const COUNTRIES: CountryOption[] = [
  { currency: 'EUR', countryHint: 'FRA', flag: '🇫🇷', symbol: '€', code: 'fr' },
  { currency: 'EUR', countryHint: 'ESP', flag: '🇪🇸', symbol: '€', code: 'es' },
  { currency: 'USD', countryHint: 'USA', flag: '🇺🇸', symbol: '$', code: 'us' },
  { currency: 'CNY', countryHint: 'CHN', flag: '🇨🇳', symbol: '¥', code: 'cn' },
  { currency: 'EUR', countryHint: 'ITA', flag: '🇮🇹', symbol: '€', code: 'it' },
  { currency: 'TRY', countryHint: 'TUR', flag: '🇹🇷', symbol: '₺', code: 'tr' },
  { currency: 'MXN', countryHint: 'MEX', flag: '🇲🇽', symbol: '$', code: 'mx' },
  { currency: 'THB', countryHint: 'THA', flag: '🇹🇭', symbol: '฿', code: 'th' },
  { currency: 'EUR', countryHint: 'DEU', flag: '🇩🇪', symbol: '€', code: 'de' },
  { currency: 'GBP', countryHint: 'GBR', flag: '🇬🇧', symbol: '£', code: 'gb' },
  { currency: 'JPY', countryHint: 'JPN', flag: '🇯🇵', symbol: '¥', code: 'jp' },
  { currency: 'EUR', countryHint: 'GRC', flag: '🇬🇷', symbol: '€', code: 'gr' },
  { currency: 'AUD', countryHint: 'AUS', flag: '🇦🇺', symbol: '$', code: 'au' },
  { currency: 'CAD', countryHint: 'CAN', flag: '🇨🇦', symbol: '$', code: 'ca' },
  { currency: 'CHF', countryHint: 'CHE', flag: '🇨🇭', symbol: 'Fr', code: 'ch' },
  { currency: 'INR', countryHint: 'IND', flag: '🇮🇳', symbol: '₹', code: 'in' },
  { currency: 'BRL', countryHint: 'BRA', flag: '🇧🇷', symbol: 'R$', code: 'br' },
  { currency: 'KRW', countryHint: 'KOR', flag: '🇰🇷', symbol: '₩', code: 'kr' },
  { currency: 'RUB', countryHint: 'RUS', flag: '🇷🇺', symbol: '₽', code: 'ru' },
  { currency: 'ZAR', countryHint: 'ZAF', flag: '🇿🇦', symbol: 'R', code: 'za' },
  { currency: 'AED', countryHint: 'ARE', flag: '🇦🇪', symbol: 'د.إ', code: 'ae' },
  { currency: 'SAR', countryHint: 'SAU', flag: '🇸🇦', symbol: '﷼', code: 'sa' },
  { currency: 'SGD', countryHint: 'SGP', flag: '🇸🇬', symbol: '$', code: 'sg' },
  { currency: 'HKD', countryHint: 'HKG', flag: '🇭🇰', symbol: '$', code: 'hk' },
  { currency: 'TWD', countryHint: 'TWN', flag: '🇹🇼', symbol: '$', code: 'tw' },
  { currency: 'SEK', countryHint: 'SWE', flag: '🇸🇪', symbol: 'kr', code: 'se' },
  { currency: 'NOK', countryHint: 'NOR', flag: '🇳🇴', symbol: 'kr', code: 'no' },
  { currency: 'DKK', countryHint: 'DNK', flag: '🇩🇰', symbol: 'kr', code: 'dk' },
  { currency: 'PLN', countryHint: 'POL', flag: '🇵🇱', symbol: 'zł', code: 'pl' },
  { currency: 'IDR', countryHint: 'IDN', flag: '🇮🇩', symbol: 'Rp', code: 'id' },
  { currency: 'MYR', countryHint: 'MYS', flag: '🇲🇾', symbol: 'RM', code: 'my' },
  { currency: 'PHP', countryHint: 'PHL', flag: '🇵🇭', symbol: '₱', code: 'ph' },
  { currency: 'VND', countryHint: 'VNM', flag: '🇻🇳', symbol: '₫', code: 'vn' },
  { currency: 'EGP', countryHint: 'EGY', flag: '🇪🇬', symbol: 'E£', code: 'eg' },
  { currency: 'NGN', countryHint: 'NGA', flag: '🇳🇬', symbol: '₦', code: 'ng' },
  { currency: 'KES', countryHint: 'KEN', flag: '🇰🇪', symbol: 'KSh', code: 'ke' },
  { currency: 'GHS', countryHint: 'GHA', flag: '🇬🇭', symbol: 'GH₵', code: 'gh' },
  { currency: 'TZS', countryHint: 'TZA', flag: '🇹🇿', symbol: 'TSh', code: 'tz' },
  { currency: 'UGX', countryHint: 'UGA', flag: '🇺🇬', symbol: 'USh', code: 'ug' },
  { currency: 'MAD', countryHint: 'MAR', flag: '🇲🇦', symbol: 'MAD', code: 'ma' },
  { currency: 'TND', countryHint: 'TUN', flag: '🇹🇳', symbol: 'TND', code: 'tn' },
  { currency: 'ARS', countryHint: 'ARG', flag: '🇦🇷', symbol: '$', code: 'ar' },
  { currency: 'CLP', countryHint: 'CHL', flag: '🇨🇱', symbol: '$', code: 'cl' },
  { currency: 'COP', countryHint: 'COL', flag: '🇨🇴', symbol: '$', code: 'co' },
  { currency: 'PEN', countryHint: 'PER', flag: '🇵🇪', symbol: 'S/.', code: 'pe' },
  { currency: 'NZD', countryHint: 'NZL', flag: '🇳🇿', symbol: '$', code: 'nz' },
  { currency: 'ILS', countryHint: 'ISR', flag: '🇮🇱', symbol: '₪', code: 'il' },
  { currency: 'CZK', countryHint: 'CZE', flag: '🇨🇿', symbol: 'Kč', code: 'cz' },
  { currency: 'HUF', countryHint: 'HUN', flag: '🇭🇺', symbol: 'Ft', code: 'hu' },
  { currency: 'RON', countryHint: 'ROU', flag: '🇷🇴', symbol: 'lei', code: 'ro' },
  { currency: 'BGN', countryHint: 'BGR', flag: '🇧🇬', symbol: 'лв', code: 'bg' },
  { currency: 'HRK', countryHint: 'HRV', flag: '🇭🇷', symbol: 'kn', code: 'hr' },
  { currency: 'ISK', countryHint: 'ISL', flag: '🇮🇸', symbol: 'kr', code: 'is' },
  { currency: 'UAH', countryHint: 'UKR', flag: '🇺🇦', symbol: '₴', code: 'ua' },
];

function getTotal(transactions: Transaction[], targetCurrency: string): number {
  return transactions.reduce((sum, t) => {
    const fromCurrency = t.originalCurrency || targetCurrency;
    const converted = convertCurrency(t.amount, fromCurrency, targetCurrency);
    return sum + converted;
  }, 0);
}

interface CountryOption {
  currency: string;
  countryHint: string;
  flag: string;
  symbol: string;
  code: string;
}

export default function Dashboard({ transactions, onCurrencyChange }: DashboardProps) {
  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(() => {
    const saved = localStorage.getItem('gofinancial_currency');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // Try to find the exact match from our cleaned up list
        return COUNTRIES.find(c => c.code === data.code) || 
               COUNTRIES.find(c => c.currency === data.currency) || 
               COUNTRIES[0];
      } catch {
        return COUNTRIES[0];
      }
    }
    return COUNTRIES[0];
  });
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem('gofinancial_user');
    if (saved) {
      return JSON.parse(saved);
    }
    const newUser: User = {
      id: crypto.randomUUID(),
      username: 'Meed',
      fullName: null,
      email: null,
      profileImage: null,
      currency: 'NGN',
      locale: 'en-NG',
      theme: 'light',
      createdAt: Date.now(),
    };
    localStorage.setItem('gofinancial_user', JSON.stringify(newUser));
    return newUser;
  });

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('gofinancial_user', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSettingsClick = () => {
    setShowSettings(true);
  };
  
  const targetCurrency = selectedCountry.currency;
  const total = getTotal(transactions, targetCurrency);
    
  const displayAmount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(total);

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
            aria-label="Select country"
            aria-expanded={isOpen}
          >
            <img 
              src={`https://flagcdn.com/w80/${selectedCountry.code}.png`} 
              alt="" 
              className={styles.flagImage} 
            />
            <span>{selectedCountry.countryHint}</span>
            <MdExpandMore size={20} className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} />
          </button>
          {isOpen && (
            <div className={styles.dropdown}>
              {COUNTRIES.map(c => (
                  <div
                    key={c.countryHint}
                    className={styles.dropdownItem}
                    onClick={() => {
                      setSelectedCountry(c);
                      localStorage.setItem('gofinancial_currency', JSON.stringify({
                        symbol: c.symbol,
                        currency: c.currency,
                        code: c.code,
                      }));
                      onCurrencyChange(c.symbol);
                      setIsOpen(false);
                    }}
                >
                  <img 
                    src={`https://flagcdn.com/w80/${c.code}.png`} 
                    alt="" 
                    className={styles.dropdownFlag} 
                  />
                  <span>{c.countryHint}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <span className={styles.balanceLabel}>{TRANSLATIONS[selectedCountry.code] || 'Total amount spent today'}</span>
        <div className={styles.balanceAmount}>
          <span className={styles.currencyCode}>{getCurrencySymbol(targetCurrency)}</span>
          <span className={styles.wholeAmount}>{whole}</span>
          <span className={styles.cents}>.{cents}</span>
        </div>
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

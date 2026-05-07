export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
  countryHint: string;
  flag: string;
  rateToUSD: number;
}

const CURRENCIES: CurrencyOption[] = [
  { code: 'ng', countryHint: 'NGA', flag: 'ng', symbol: '₦', name: 'Nigerian Naira', rateToUSD: 0.00065 },
  { code: 'us', countryHint: 'USA', flag: 'us', symbol: '$', name: 'US Dollar', rateToUSD: 1 },
  { code: 'gb', countryHint: 'GBR', flag: 'gb', symbol: '£', name: 'British Pound', rateToUSD: 1.27 },
  { code: 'eu', countryHint: 'EUR', flag: 'eu', symbol: '€', name: 'Euro', rateToUSD: 1.08 },
  { code: 'in', countryHint: 'IND', flag: 'in', symbol: '₹', name: 'Indian Rupee', rateToUSD: 0.012 },
  { code: 'jp', countryHint: 'JPN', flag: 'jp', symbol: '¥', name: 'Japanese Yen', rateToUSD: 0.0067 },
  { code: 'cn', countryHint: 'CHN', flag: 'cn', symbol: '¥', name: 'Chinese Yuan', rateToUSD: 0.14 },
  { code: 'kr', countryHint: 'KOR', flag: 'kr', symbol: '₩', name: 'South Korean Won', rateToUSD: 0.00074 },
  { code: 'br', countryHint: 'BRA', flag: 'br', symbol: 'R$', name: 'Brazilian Real', rateToUSD: 0.20 },
  { code: 'ru', countryHint: 'RUS', flag: 'ru', symbol: '₽', name: 'Russian Ruble', rateToUSD: 0.011 },
  { code: 'za', countryHint: 'ZAF', flag: 'za', symbol: 'R', name: 'South African Rand', rateToUSD: 0.054 },
  { code: 'au', countryHint: 'AUS', flag: 'au', symbol: 'A$', name: 'Australian Dollar', rateToUSD: 0.65 },
  { code: 'ca', countryHint: 'CAN', flag: 'ca', symbol: 'C$', name: 'Canadian Dollar', rateToUSD: 0.73 },
  { code: 'ch', countryHint: 'CHE', flag: 'ch', symbol: 'Fr', name: 'Swiss Franc', rateToUSD: 1.13 },
  { code: 'mx', countryHint: 'MEX', flag: 'mx', symbol: '$', name: 'Mexican Peso', rateToUSD: 0.058 },
  { code: 'th', countryHint: 'THA', flag: 'th', symbol: '฿', name: 'Thai Baht', rateToUSD: 0.028 },
  { code: 'ae', countryHint: 'ARE', flag: 'ae', symbol: 'د.إ', name: 'UAE Dirham', rateToUSD: 0.27 },
  { code: 'sa', countryHint: 'SAU', flag: 'sa', symbol: '﷼', name: 'Saudi Riyal', rateToUSD: 0.27 },
  { code: 'sg', countryHint: 'SGP', flag: 'sg', symbol: 'S$', name: 'Singapore Dollar', rateToUSD: 0.74 },
  { code: 'hk', countryHint: 'HKG', flag: 'hk', symbol: 'HK$', name: 'Hong Kong Dollar', rateToUSD: 0.13 },
  { code: 'tw', countryHint: 'TWN', flag: 'tw', symbol: 'NT$', name: 'Taiwan Dollar', rateToUSD: 0.031 },
  { code: 'se', countryHint: 'SWE', flag: 'se', symbol: 'kr', name: 'Swedish Krona', rateToUSD: 0.096 },
  { code: 'no', countryHint: 'NOR', flag: 'no', symbol: 'kr', name: 'Norwegian Krone', rateToUSD: 0.094 },
  { code: 'dk', countryHint: 'DNK', flag: 'dk', symbol: 'kr', name: 'Danish Krone', rateToUSD: 0.15 },
  { code: 'pl', countryHint: 'POL', flag: 'pl', symbol: 'zł', name: 'Polish Zloty', rateToUSD: 0.25 },
  { code: 'id', countryHint: 'IDN', flag: 'id', symbol: 'Rp', name: 'Indonesian Rupiah', rateToUSD: 0.000064 },
  { code: 'my', countryHint: 'MYS', flag: 'my', symbol: 'RM', name: 'Malaysian Ringgit', rateToUSD: 0.22 },
  { code: 'ph', countryHint: 'PHL', flag: 'ph', symbol: '₱', name: 'Philippine Peso', rateToUSD: 0.018 },
  { code: 'vn', countryHint: 'VNM', flag: 'vn', symbol: '₫', name: 'Vietnamese Dong', rateToUSD: 0.000039 },
  { code: 'eg', countryHint: 'EGY', flag: 'eg', symbol: 'E£', name: 'Egyptian Pound', rateToUSD: 0.020 },
  { code: 'ke', countryHint: 'KEN', flag: 'ke', symbol: 'KSh', name: 'Kenyan Shilling', rateToUSD: 0.0077 },
  { code: 'gh', countryHint: 'GHA', flag: 'gh', symbol: 'GH₵', name: 'Ghanaian Cedi', rateToUSD: 0.071 },
  { code: 'tz', countryHint: 'TZA', flag: 'tz', symbol: 'TSh', name: 'Tanzanian Shilling', rateToUSD: 0.00039 },
  { code: 'ug', countryHint: 'UGA', flag: 'ug', symbol: 'USh', name: 'Ugandan Shilling', rateToUSD: 0.00027 },
  { code: 'ma', countryHint: 'MAR', flag: 'ma', symbol: 'MAD', name: 'Moroccan Dirham', rateToUSD: 0.10 },
  { code: 'tn', countryHint: 'TUN', flag: 'tn', symbol: 'TND', name: 'Tunisian Dinar', rateToUSD: 0.32 },
  { code: 'ar', countryHint: 'ARG', flag: 'ar', symbol: '$', name: 'Argentine Peso', rateToUSD: 0.00087 },
  { code: 'cl', countryHint: 'CHL', flag: 'cl', symbol: '$', name: 'Chilean Peso', rateToUSD: 0.0011 },
  { code: 'co', countryHint: 'COL', flag: 'co', symbol: '$', name: 'Colombian Peso', rateToUSD: 0.00025 },
  { code: 'pe', countryHint: 'PER', flag: 'pe', symbol: 'S/.', name: 'Peruvian Sol', rateToUSD: 0.27 },
  { code: 'nz', countryHint: 'NZL', flag: 'nz', symbol: 'NZ$', name: 'New Zealand Dollar', rateToUSD: 0.59 },
  { code: 'il', countryHint: 'ISR', flag: 'il', symbol: '₪', name: 'Israeli Shekel', rateToUSD: 0.27 },
  { code: 'cz', countryHint: 'CZE', flag: 'cz', symbol: 'Kč', name: 'Czech Koruna', rateToUSD: 0.044 },
  { code: 'hu', countryHint: 'HUN', flag: 'hu', symbol: 'Ft', name: 'Hungarian Forint', rateToUSD: 0.0028 },
  { code: 'ro', countryHint: 'ROU', flag: 'ro', symbol: 'lei', name: 'Romanian Leu', rateToUSD: 0.22 },
  { code: 'bg', countryHint: 'BGR', flag: 'bg', symbol: 'лв', name: 'Bulgarian Lev', rateToUSD: 0.55 },
  { code: 'is', countryHint: 'ISL', flag: 'is', symbol: 'kr', name: 'Icelandic Krona', rateToUSD: 0.0073 },
  { code: 'ua', countryHint: 'UKR', flag: 'ua', symbol: '₴', name: 'Ukrainian Hryvnia', rateToUSD: 0.024 },
  { code: 'tr', countryHint: 'TUR', flag: 'tr', symbol: '₺', name: 'Turkish Lira', rateToUSD: 0.031 },
];

const DEFAULT_CURRENCY_CODE = 'ng';

export function getCurrencies(): CurrencyOption[] {
  return CURRENCIES;
}

export function getDefaultCurrency(): CurrencyOption {
  return CURRENCIES.find(c => c.code === DEFAULT_CURRENCY_CODE) || CURRENCIES[0];
}

export function getCurrencyByCode(code: string): CurrencyOption | undefined {
  return CURRENCIES.find(c => c.code === code);
}

export function getCurrencyISOCode(currency: CurrencyOption): string {
  const codeMap: Record<string, string> = {
    ng: 'NGN', us: 'USD', gb: 'GBP', eu: 'EUR', in: 'INR',
    jp: 'JPY', cn: 'CNY', kr: 'KRW', br: 'BRL', ru: 'RUB',
    za: 'ZAR', au: 'AUD', ca: 'CAD', ch: 'CHF', mx: 'MXN',
    th: 'THB', ae: 'AED', sa: 'SAR', sg: 'SGD', hk: 'HKD',
    tw: 'TWD', se: 'SEK', no: 'NOK', dk: 'DKK', pl: 'PLN',
    id: 'IDR', my: 'MYR', ph: 'PHP', vn: 'VND', eg: 'EGP',
    ke: 'KES', gh: 'GHS', tz: 'TZS', ug: 'UGX', ma: 'MAD',
    tn: 'TND', ar: 'ARS', cl: 'CLP', co: 'COP', pe: 'PEN',
    nz: 'NZD', il: 'ILS', cz: 'CZK', hu: 'HUF', ro: 'RON',
    bg: 'BGN', is: 'ISK', ua: 'UAH', tr: 'TRY',
  };
  return codeMap[currency.code] || 'USD';
}

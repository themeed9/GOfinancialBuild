export interface Currency {
  /** ISO 4217 code, e.g. "NGN" */
  code: string;
  symbol: string;
  name: string;
  /** Digits after the decimal point (ISO 4217 minor units) */
  decimals: number;
}

/**
 * Supported currencies. Unlike the web app, there are no hard-coded
 * exchange rates: every transaction keeps the currency it was entered in,
 * so changing the display currency never rewrites past amounts with
 * stale rates.
 */
export const CURRENCIES: readonly Currency[] = [
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', decimals: 2 },
  { code: 'USD', symbol: '$', name: 'US Dollar', decimals: 2 },
  { code: 'GBP', symbol: '£', name: 'British Pound', decimals: 2 },
  { code: 'EUR', symbol: '€', name: 'Euro', decimals: 2 },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', decimals: 2 },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', decimals: 2 },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', decimals: 2 },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', decimals: 2 },
  { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling', decimals: 2 },
  { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling', decimals: 0 },
  { code: 'MAD', symbol: 'MAD', name: 'Moroccan Dirham', decimals: 2 },
  { code: 'TND', symbol: 'TND', name: 'Tunisian Dinar', decimals: 3 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', decimals: 2 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', decimals: 0 },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', decimals: 2 },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', decimals: 0 },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', decimals: 2 },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble', decimals: 2 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', decimals: 2 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', decimals: 2 },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', decimals: 2 },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', decimals: 2 },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', decimals: 2 },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', decimals: 2 },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', decimals: 2 },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', decimals: 2 },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', decimals: 2 },
  { code: 'TWD', symbol: 'NT$', name: 'Taiwan Dollar', decimals: 2 },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', decimals: 2 },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', decimals: 2 },
  { code: 'DKK', symbol: 'kr', name: 'Danish Krone', decimals: 2 },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty', decimals: 2 },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', decimals: 2 },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', decimals: 2 },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', decimals: 2 },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', decimals: 0 },
  { code: 'ARS', symbol: 'AR$', name: 'Argentine Peso', decimals: 2 },
  { code: 'CLP', symbol: 'CL$', name: 'Chilean Peso', decimals: 0 },
  { code: 'COP', symbol: 'CO$', name: 'Colombian Peso', decimals: 2 },
  { code: 'PEN', symbol: 'S/.', name: 'Peruvian Sol', decimals: 2 },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', decimals: 2 },
  { code: 'ILS', symbol: '₪', name: 'Israeli Shekel', decimals: 2 },
  { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', decimals: 2 },
  { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', decimals: 2 },
  { code: 'RON', symbol: 'lei', name: 'Romanian Leu', decimals: 2 },
  { code: 'BGN', symbol: 'лв', name: 'Bulgarian Lev', decimals: 2 },
  { code: 'ISK', symbol: 'kr', name: 'Icelandic Krona', decimals: 0 },
  { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia', decimals: 2 },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira', decimals: 2 },
];

export const DEFAULT_CURRENCY_CODE = 'NGN';

export function getCurrency(code: string): Currency {
  return (
    CURRENCIES.find((c) => c.code === code) ??
    // Unknown codes still format sensibly instead of crashing.
    { code, symbol: code, name: code, decimals: 2 }
  );
}

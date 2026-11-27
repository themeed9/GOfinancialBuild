/**
 * Money is stored as an integer count of minor units (kobo, cents, …).
 * Floats are only used at the edge, for display. This avoids rounding
 * drift such as 0.1 + 0.2 !== 0.3 when summing many transactions.
 */
import { getCurrency } from './currencies';

/** Largest amount a single entry may have, in major units. */
export const MAX_ENTRY_MAJOR = 1_000_000_000;

export type AmountParseResult =
  | { ok: true; minor: number }
  | { ok: false; error: 'empty' | 'invalid' | 'zero' | 'too-many-decimals' | 'too-large' };

function factor(decimals: number): number {
  return 10 ** decimals;
}

/**
 * Parses keypad input such as "6000.05" into minor units.
 * Negative numbers, letters and grouping separators are rejected:
 * the in-app keypad only produces digits and one ".".
 */
export function parseAmountInput(input: string, currencyCode: string): AmountParseResult {
  const text = input.trim();
  if (text === '') return { ok: false, error: 'empty' };
  if (!/^\d+(\.\d*)?$|^\.\d+$/.test(text)) return { ok: false, error: 'invalid' };

  const { decimals } = getCurrency(currencyCode);
  const [wholePart, fractionPart = ''] = text.split('.');
  if (fractionPart.length > decimals) return { ok: false, error: 'too-many-decimals' };

  const whole = Number(wholePart || '0');
  if (whole > MAX_ENTRY_MAJOR) return { ok: false, error: 'too-large' };

  const fraction = Number(fractionPart.padEnd(decimals, '0') || '0');
  const minor = whole * factor(decimals) + fraction;
  if (minor === 0) return { ok: false, error: 'zero' };
  if (minor > MAX_ENTRY_MAJOR * factor(decimals)) return { ok: false, error: 'too-large' };
  return { ok: true, minor };
}

export interface MoneyParts {
  /** "-" for negative amounts, otherwise "" */
  sign: string;
  symbol: string;
  /** Grouped whole units, e.g. "6,000" */
  whole: string;
  /** Locale decimal separator, or "" when the currency has no minor units */
  separator: string;
  /** Minor digits, e.g. "05", or "" */
  fraction: string;
}

function decimalSeparator(locale: string): string {
  const sample = new Intl.NumberFormat(locale, { minimumFractionDigits: 1 }).format(1.5);
  const match = sample.match(/[^\d]/);
  return match ? match[0] : '.';
}

/**
 * Splits an amount for the large display (₦6,000 + .05 in a smaller size).
 * Built from plain number formatting so it behaves the same on every
 * JavaScript engine the app runs on.
 */
export function moneyParts(minor: number, currencyCode: string, locale: string): MoneyParts {
  const { decimals, symbol } = getCurrency(currencyCode);
  const abs = Math.abs(Math.round(minor));
  const f = factor(decimals);
  const wholeUnits = Math.floor(abs / f);
  const fractionUnits = abs % f;

  return {
    sign: minor < 0 ? '-' : '',
    symbol,
    whole: new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(wholeUnits),
    separator: decimals > 0 ? decimalSeparator(locale) : '',
    fraction: decimals > 0 ? String(fractionUnits).padStart(decimals, '0') : '',
  };
}

export interface FormatOptions {
  /** Hide ".00" when the amount is whole. Default false. */
  trimZeroFraction?: boolean;
}

export function formatMoney(
  minor: number,
  currencyCode: string,
  locale: string,
  options: FormatOptions = {},
): string {
  const p = moneyParts(minor, currencyCode, locale);
  const showFraction = p.fraction !== '' && !(options.trimZeroFraction && Number(p.fraction) === 0);
  return `${p.sign}${p.symbol}${p.whole}${showFraction ? p.separator + p.fraction : ''}`;
}

export function sumMinor(values: Iterable<number>): number {
  let total = 0;
  for (const v of values) total += v;
  return total;
}

/**
 * Short form for tight spaces such as chart labels:
 * ₦3,280 · ₦40,000 · ₦111.5k · ₦2.3M (whole units, no fraction).
 */
export function formatCompactMoney(minor: number, currencyCode: string, locale: string): string {
  const { decimals, symbol } = getCurrency(currencyCode);
  const major = Math.round(Math.abs(minor) / factor(decimals));
  const sign = minor < 0 ? '-' : '';
  const oneDecimal = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });

  if (major >= 1_000_000) return `${sign}${symbol}${oneDecimal.format(major / 1_000_000)}M`;
  if (major >= 100_000) return `${sign}${symbol}${oneDecimal.format(major / 1_000)}k`;
  return `${sign}${symbol}${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(major)}`;
}

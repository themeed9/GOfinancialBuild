/**
 * Keypad input for amounts. The text is what the user typed ("6000.5");
 * parseAmountInput turns it into minor units when saving.
 */
import { getCurrency } from './currencies';

export type KeypadKey = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '.' | 'backspace';

/** Ten whole digits is already far above any single expense. */
const MAX_WHOLE_DIGITS = 10;

export function applyKey(text: string, key: KeypadKey, currencyCode: string): string {
  const { decimals } = getCurrency(currencyCode);

  if (key === 'backspace') return text.slice(0, -1);

  if (key === '.') {
    if (decimals === 0 || text.includes('.')) return text;
    return text === '' ? '0.' : `${text}.`;
  }

  const [whole, fraction] = text.split('.');
  if (fraction !== undefined) {
    return fraction.length >= decimals ? text : text + key;
  }
  if (whole === '0') return key; // no leading zeros
  if (whole.length >= MAX_WHOLE_DIGITS) return text;
  return text + key;
}

/** Text for the big amount while typing: "₦6,000.5" (grouping added, digits kept as typed). */
export function displayAmountInput(text: string, currencyCode: string, locale: string): string {
  const { symbol } = getCurrency(currencyCode);
  if (text === '') return `${symbol}0`;
  const [whole, fraction] = text.split('.');
  const grouped = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(Number(whole || '0'));
  if (fraction === undefined) return `${symbol}${grouped}`;
  const separator = new Intl.NumberFormat(locale, { minimumFractionDigits: 1 }).format(1.5).replace(/\d/g, '');
  return `${symbol}${grouped}${separator}${fraction}`;
}

/** Turns a stored amount back into keypad text for editing: 600005 → "6000.05". */
export function minorToInputText(minor: number, currencyCode: string): string {
  const { decimals } = getCurrency(currencyCode);
  if (decimals === 0) return String(minor);
  const f = 10 ** decimals;
  const whole = Math.floor(minor / f);
  const fraction = String(minor % f).padStart(decimals, '0').replace(/0+$/, '');
  return fraction === '' ? String(whole) : `${whole}.${fraction}`;
}

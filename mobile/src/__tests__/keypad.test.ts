import { describe, expect, it } from 'vitest';

import { applyKey, displayAmountInput, minorToInputText, type KeypadKey } from '../core/keypad';
import { parseAmountInput } from '../core/money';

const type = (keys: KeypadKey[], currency = 'NGN') => keys.reduce((t, k) => applyKey(t, k, currency), '');

describe('keypad', () => {
  it('builds an amount from key presses', () => {
    expect(type(['6', '0', '0', '0', '.', '0', '5'])).toBe('6000.05');
  });

  it('stops at the currency’s number of decimals', () => {
    expect(type(['1', '.', '2', '3', '4'])).toBe('1.23');
    expect(type(['1', '.', '2'], 'JPY')).toBe('12');
    expect(type(['1', '.', '2', '3', '4', '5'], 'TND')).toBe('1.234');
  });

  it('allows only one decimal point and adds a leading zero', () => {
    expect(type(['.', '5', '.'])).toBe('0.5');
  });

  it('drops leading zeros but keeps "0." for decimals', () => {
    expect(type(['0', '0', '7'])).toBe('7');
    expect(type(['0', '.', '5'])).toBe('0.5');
  });

  it('limits absurdly long whole numbers', () => {
    expect(type(Array<KeypadKey>(12).fill('9'))).toBe('9999999999');
  });

  it('deletes with backspace', () => {
    expect(type(['1', '2', '.', '5', 'backspace', 'backspace'])).toBe('12');
    expect(type(['backspace'])).toBe('');
  });

  it('always produces text the parser accepts or reports clearly', () => {
    expect(parseAmountInput(type(['3', '2', '8', '0']), 'NGN')).toEqual({ ok: true, minor: 328000 });
    expect(parseAmountInput(type(['0']), 'NGN')).toEqual({ ok: false, error: 'zero' });
    expect(parseAmountInput(type([]), 'NGN')).toEqual({ ok: false, error: 'empty' });
  });

  it('shows the typed amount with grouping', () => {
    expect(displayAmountInput('', 'NGN', 'en-NG')).toBe('₦0');
    expect(displayAmountInput('6000', 'NGN', 'en-NG')).toBe('₦6,000');
    expect(displayAmountInput('6000.', 'NGN', 'en-NG')).toBe('₦6,000.');
    expect(displayAmountInput('6000.5', 'NGN', 'en-NG')).toBe('₦6,000.5');
    expect(displayAmountInput('1234.5', 'EUR', 'de-DE')).toBe('€1.234,5');
  });

  it('converts stored amounts back to editable text', () => {
    expect(minorToInputText(600005, 'NGN')).toBe('6000.05');
    expect(minorToInputText(328000, 'NGN')).toBe('3280');
    expect(minorToInputText(328050, 'NGN')).toBe('3280.5');
    expect(minorToInputText(500, 'JPY')).toBe('500');
  });
});

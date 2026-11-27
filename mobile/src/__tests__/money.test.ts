import { describe, expect, it } from 'vitest';

import { getCurrency } from '../core/currencies';
import { formatCompactMoney, formatMoney, moneyParts, parseAmountInput, sumMinor } from '../core/money';

describe('money', () => {
  describe('parseAmountInput', () => {
    it('converts major units to minor units', () => {
      expect(parseAmountInput('6000.05', 'NGN')).toEqual({ ok: true, minor: 600005 });
      expect(parseAmountInput('3280', 'NGN')).toEqual({ ok: true, minor: 328000 });
      expect(parseAmountInput('.5', 'NGN')).toEqual({ ok: true, minor: 50 });
      expect(parseAmountInput('12.', 'NGN')).toEqual({ ok: true, minor: 1200 });
    });

    it('respects currencies without minor units or with three decimals', () => {
      expect(parseAmountInput('500', 'JPY')).toEqual({ ok: true, minor: 500 });
      expect(parseAmountInput('1.5', 'JPY')).toEqual({ ok: false, error: 'too-many-decimals' });
      expect(parseAmountInput('1.234', 'TND')).toEqual({ ok: true, minor: 1234 });
    });

    it('blocks empty, invalid, negative and zero input', () => {
      expect(parseAmountInput('', 'NGN')).toEqual({ ok: false, error: 'empty' });
      expect(parseAmountInput('   ', 'NGN')).toEqual({ ok: false, error: 'empty' });
      expect(parseAmountInput('abc', 'NGN')).toEqual({ ok: false, error: 'invalid' });
      expect(parseAmountInput('-50', 'NGN')).toEqual({ ok: false, error: 'invalid' });
      expect(parseAmountInput('1,000', 'NGN')).toEqual({ ok: false, error: 'invalid' });
      expect(parseAmountInput('1.2.3', 'NGN')).toEqual({ ok: false, error: 'invalid' });
      expect(parseAmountInput('0', 'NGN')).toEqual({ ok: false, error: 'zero' });
      expect(parseAmountInput('0.00', 'NGN')).toEqual({ ok: false, error: 'zero' });
    });

    it('rejects too many decimals and absurdly large amounts', () => {
      expect(parseAmountInput('1.234', 'NGN')).toEqual({ ok: false, error: 'too-many-decimals' });
      expect(parseAmountInput('1000000001', 'NGN')).toEqual({ ok: false, error: 'too-large' });
      expect(parseAmountInput('1000000000.01', 'NGN')).toEqual({ ok: false, error: 'too-large' });
    });
  });

  describe('moneyParts', () => {
    it('splits an amount for the large dashboard display', () => {
      expect(moneyParts(600005, 'NGN', 'en-NG')).toEqual({
        sign: '',
        symbol: '₦',
        whole: '6,000',
        separator: '.',
        fraction: '05',
      });
    });

    it('marks negative balances', () => {
      expect(moneyParts(-150, 'NGN', 'en-NG').sign).toBe('-');
    });

    it('uses the locale decimal separator', () => {
      const parts = moneyParts(123456, 'EUR', 'de-DE');
      expect(parts.whole).toBe('1.234');
      expect(parts.separator).toBe(',');
      expect(parts.fraction).toBe('56');
    });

    it('omits the fraction for zero-decimal currencies', () => {
      expect(moneyParts(5000, 'JPY', 'en-US')).toMatchObject({ whole: '5,000', separator: '', fraction: '' });
    });
  });

  describe('formatMoney', () => {
    it('formats with symbol and decimals', () => {
      expect(formatMoney(328000, 'NGN', 'en-NG')).toBe('₦3,280.00');
      expect(formatMoney(-2500, 'USD', 'en-US')).toBe('-$25.00');
    });

    it('can hide a zero fraction', () => {
      expect(formatMoney(328000, 'NGN', 'en-NG', { trimZeroFraction: true })).toBe('₦3,280');
      expect(formatMoney(328050, 'NGN', 'en-NG', { trimZeroFraction: true })).toBe('₦3,280.50');
    });
  });

  it('formats compact amounts for chart labels', () => {
    expect(formatCompactMoney(328000, 'NGN', 'en-NG')).toBe('₦3,280');
    expect(formatCompactMoney(4000000, 'NGN', 'en-NG')).toBe('₦40,000');
    expect(formatCompactMoney(11152000, 'NGN', 'en-NG')).toBe('₦111.5k');
    expect(formatCompactMoney(230000000, 'NGN', 'en-NG')).toBe('₦2.3M');
    expect(formatCompactMoney(0, 'NGN', 'en-NG')).toBe('₦0');
  });

  it('sums minor units exactly', () => {
    // 0.1 + 0.2 in kobo is exactly 30, unlike floating-point naira.
    expect(sumMinor([10, 20])).toBe(30);
    expect(sumMinor(Array.from({ length: 1000 }, () => 1))).toBe(1000);
  });

  it('falls back gracefully for unknown currency codes', () => {
    expect(getCurrency('XYZ')).toEqual({ code: 'XYZ', symbol: 'XYZ', name: 'XYZ', decimals: 2 });
  });
});

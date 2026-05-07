import { describe, it, expect } from 'vitest';
import { getCurrencies, getDefaultCurrency, getCurrencyByCode, getCurrencyISOCode } from '../data/currencies';
import { convertCurrency, getCurrencySymbol, getCurrencyCodeFromSymbol } from '../utils/currency';

describe('Currency Conversion', () => {
  it('returns same amount for same currency', () => {
    const result = convertCurrency(100, 'USD', 'USD');
    expect(result).toBe(100);
  });

  it('converts between different currencies', () => {
    const result = convertCurrency(1, 'USD', 'NGN');
    expect(result).toBeGreaterThan(1);
  });

  it('returns original amount if currency not found', () => {
    const result = convertCurrency(100, 'XXX', 'YYY');
    expect(result).toBe(100);
  });

  it('converts using CurrencyOption objects', () => {
    const usd = getCurrencies().find(c => c.code === 'us');
    const ngn = getDefaultCurrency();
    expect(usd).toBeDefined();

    const result = convertCurrency(1, usd!, ngn);
    expect(result).toBeGreaterThan(1);
  });

  it('converts from string ISO code to CurrencyOption', () => {
    const ngn = getDefaultCurrency();
    const result = convertCurrency(100, 'USD', ngn);
    expect(result).toBeGreaterThan(100);
  });

  it('converts from CurrencyOption to string ISO code', () => {
    const usd = getCurrencies().find(c => c.code === 'us');
    expect(usd).toBeDefined();

    const result = convertCurrency(1000, usd!, 'NGN');
    expect(result).toBeGreaterThan(1000);
  });

  it('preserves conversion accuracy using rateToUSD', () => {
    const ngn = getDefaultCurrency();
    const usd = getCurrencies().find(c => c.code === 'us');
    expect(usd).toBeDefined();

    const ngnRate = ngn.rateToUSD;
    const usdRate = usd!.rateToUSD;

    const expectedNGN = (1 * usdRate) / ngnRate;
    const actualNGN = convertCurrency(1, usd!, ngn);

    expect(actualNGN).toBeCloseTo(expectedNGN, 4);
  });
});

describe('Currency Data', () => {
  it('has default currency (NGN)', () => {
    const defaultCurrency = getDefaultCurrency();
    expect(defaultCurrency.code).toBe('ng');
    expect(defaultCurrency.symbol).toBe('₦');
  });

  it('has currencies array with expected count', () => {
    const currencies = getCurrencies();
    expect(currencies.length).toBeGreaterThan(10);
  });

  it('contains USD currency', () => {
    const usd = getCurrencies().find(c => c.code === 'us');
    expect(usd).toBeDefined();
    expect(usd?.symbol).toBe('$');
    expect(usd?.countryHint).toBe('USA');
  });

  it('contains GBP currency', () => {
    const gbp = getCurrencies().find(c => c.code === 'gb');
    expect(gbp).toBeDefined();
    expect(gbp?.symbol).toBe('£');
  });

  it('maps currency codes correctly', () => {
    const ngCurrency = getDefaultCurrency();
    expect(getCurrencyISOCode(ngCurrency)).toBe('NGN');

    const usd = getCurrencies().find(c => c.code === 'us');
    expect(usd).toBeDefined();
    expect(getCurrencyISOCode(usd!)).toBe('USD');
  });

  it('finds currency by code', () => {
    const found = getCurrencyByCode('ng');
    expect(found).toBeDefined();
    expect(found?.code).toBe('ng');
  });

  it('returns undefined for non-existent code', () => {
    const found = getCurrencyByCode('xx');
    expect(found).toBeUndefined();
  });
});

describe('Currency Symbol Utilities', () => {
  it('gets symbol for known currency', () => {
    expect(getCurrencySymbol('USD')).toBe('$');
    expect(getCurrencySymbol('NGN')).toBe('₦');
    expect(getCurrencySymbol('GBP')).toBe('£');
  });

  it('returns default symbol for unknown currency', () => {
    expect(getCurrencySymbol('XXX')).toBe('$');
  });

  it('gets currency code from symbol', () => {
    expect(getCurrencyCodeFromSymbol('₦')).toBe('NGN');
    expect(getCurrencyCodeFromSymbol('£')).toBe('GBP');
  });

  it('returns USD for unknown symbol', () => {
    expect(getCurrencyCodeFromSymbol('?')).toBe('USD');
  });
});

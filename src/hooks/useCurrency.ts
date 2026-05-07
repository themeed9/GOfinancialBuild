import { useState, useCallback, useMemo } from 'react';
import { getCurrencies, getDefaultCurrency, getCurrencyByCode, getCurrencyISOCode, type CurrencyOption } from '../data/currencies';

const STORAGE_KEY = 'gofinancial_currency';

function loadSavedCurrency(): CurrencyOption {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      const found = getCurrencyByCode(data.code);
      if (found) return found;
    }
  } catch {
    // ignore parse errors
  }
  return getDefaultCurrency();
}

function saveCurrency(currency: CurrencyOption): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    symbol: currency.symbol,
    currency: getCurrencyISOCode(currency),
    code: currency.code,
  }));
}

export interface UseCurrencyReturn {
  currency: CurrencyOption;
  isoCode: string;
  setCurrency: (currency: CurrencyOption) => void;
  currencies: CurrencyOption[];
}

export function useCurrency(): UseCurrencyReturn {
  const [currency, setCurrencyState] = useState<CurrencyOption>(loadSavedCurrency);

  const setCurrency = useCallback((newCurrency: CurrencyOption) => {
    setCurrencyState(newCurrency);
    saveCurrency(newCurrency);
  }, []);

  const isoCode = useMemo(() => getCurrencyISOCode(currency), [currency]);
  const currencies = useMemo(() => getCurrencies(), []);

  return { currency, isoCode, setCurrency, currencies };
}

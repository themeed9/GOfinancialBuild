import { getCurrencies, getCurrencyISOCode, type CurrencyOption } from '../data/currencies';

export function convertCurrency(
  amount: number,
  fromCurrency: CurrencyOption | string,
  toCurrency: CurrencyOption | string
): number {
  const fromCode = typeof fromCurrency === 'string' ? fromCurrency : getCurrencyISOCode(fromCurrency);
  const toCode = typeof toCurrency === 'string' ? toCurrency : getCurrencyISOCode(toCurrency);

  if (fromCode === toCode) {
    return amount;
  }

  const currencies = getCurrencies();
  const from = currencies.find(c => getCurrencyISOCode(c) === fromCode);
  const to = currencies.find(c => getCurrencyISOCode(c) === toCode);

  if (!from || !to) {
    console.warn(`Exchange rate not found for ${fromCode} or ${toCode}`);
    return amount;
  }

  const amountInUSD = amount * from.rateToUSD;
  const convertedAmount = amountInUSD / to.rateToUSD;

  return convertedAmount;
}

export function getCurrencySymbol(currencyCode: string): string {
  const currencies = getCurrencies();
  const currency = currencies.find(c => getCurrencyISOCode(c) === currencyCode);
  return currency?.symbol || '$';
}

export function getCurrencyCodeFromSymbol(symbol: string): string {
  const currencies = getCurrencies();
  const entry = currencies.find(c => c.symbol === symbol);
  return entry ? getCurrencyISOCode(entry) : 'USD';
}

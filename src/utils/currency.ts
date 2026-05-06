import { EXCHANGE_RATES } from '../data/exchangeRates';

export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }

  const fromRate = EXCHANGE_RATES[fromCurrency];
  const toRate = EXCHANGE_RATES[toCurrency];

  if (!fromRate || !toRate) {
    console.warn(`Exchange rate not found for ${fromCurrency} or ${toCurrency}`);
    return amount;
  }

  const amountInUSD = amount * fromRate.rateToUSD;
  const convertedAmount = amountInUSD / toRate.rateToUSD;

  return convertedAmount;
}

export function getCurrencySymbol(currencyCode: string): string {
  const rate = EXCHANGE_RATES[currencyCode];
  return rate?.symbol || '$';
}

export function getCurrencyCodeFromSymbol(symbol: string): string {
  const entry = Object.entries(EXCHANGE_RATES).find(
    ([_, data]) => data.symbol === symbol
  );
  return entry ? entry[0] : 'USD';
}

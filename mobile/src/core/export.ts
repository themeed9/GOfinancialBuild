/** CSV export (Settings → Export data): the user's backup and route out. */
import { getCategory } from './categories';
import { getCurrency } from './currencies';
import type { Transaction } from './types';

function cell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function isoLocal(time: number): string {
  const d = new Date(time);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function transactionsToCsv(transactions: readonly Transaction[]): string {
  const rows = transactions
    .filter((t) => t.deletedAt === null)
    .sort((a, b) => a.occurredAt - b.occurredAt)
    .map((t) => {
      const { decimals } = getCurrency(t.currency);
      const amount = (t.amountMinor / 10 ** decimals).toFixed(decimals);
      return [isoLocal(t.occurredAt), getCategory(t.categoryId).name, amount, t.currency, t.note].map(cell).join(',');
    });
  return ['Date,Category,Amount,Currency,Note', ...rows].join('\n');
}

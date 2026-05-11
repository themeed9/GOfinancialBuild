export type BudgetPeriod = 'day' | 'week' | 'month' | 'year';

export interface Budget {
  amount: number;
  period: BudgetPeriod;
  createdAt: number;
  updatedAt: number;
}

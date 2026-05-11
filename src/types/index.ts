export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Transaction {
  id: string;
  amount: number;
  categoryId: string;
  note: string;
  timestamp: number;
  createdAt: number;
  updatedAt: number;
  originalCurrency?: string;
}

export interface DailySummary {
  date: string;
  totalSpent: number;
}

export interface User {
  id: string;
  username: string;
  fullName: string | null;
  email: string | null;
  profileImage: string | null;
  currency: string;
  locale: string;
  theme: 'light' | 'dark';
  createdAt: number;
  name?: string;
}

import type { Category } from './types';

export const DEFAULT_CATEGORIES: readonly Category[] = [
  { id: 'food-dining', name: 'Food & Dining', icon: '🍽️' },
  { id: 'transport', name: 'Transportation', icon: '🚗' },
  { id: 'shopping', name: 'Shopping', icon: '🛒' },
  { id: 'bills', name: 'Bills & Utilities', icon: '📄' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
  { id: 'health', name: 'Health', icon: '💊' },
  { id: 'education', name: 'Education', icon: '📚' },
  { id: 'other', name: 'Other', icon: '📌' },
];

/** "Food & Dining" → "food-dining" (rules from the project brief) */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-');
}

export function getCategory(id: string): Category {
  return DEFAULT_CATEGORIES.find((c) => c.id === id) ?? DEFAULT_CATEGORIES[DEFAULT_CATEGORIES.length - 1];
}

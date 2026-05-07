import type { Transaction } from '../types';

const DB_NAME = 'gofinancial-db';
const DB_VERSION = 2;
const STORE_NAME = 'transactions';

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      dbPromise = null;
      reject(request.error);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;
      const oldVersion = event.oldVersion;

      if (oldVersion === 0) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
        store.createIndex('categoryId', 'categoryId', { unique: false });
      }

      if (oldVersion === 1) {
        const store = request.transaction?.objectStore(STORE_NAME);
        if (store) {
          store.createIndex('categoryId', 'categoryId', { unique: false });
        }
      }
    };

    request.onsuccess = () => resolve(request.result);
  });

  return dbPromise;
}

export async function addTransaction(transaction: Transaction): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.add(transaction);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getTransactions(): Promise<Transaction[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteTransaction(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function updateTransaction(transaction: Transaction): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.put(transaction);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getTransactionsByCategory(categoryId: string): Promise<Transaction[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('categoryId');
    const request = index.getAll(categoryId);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Cloud sync hooks for Phase 2
export const IDBTransactionStorage = {
  async syncToCloud(userId: string, transactions: Transaction[], categories: Array<{ id: string; name: string; icon: string }>): Promise<void> {
    // Future: Implement background sync using Service Worker or API calls
    // For now, we prepare the local state to be pushed when online
    const syncPayload = { userId, transactions, categories, syncedAt: new Date().toISOString() };
    localStorage.setItem('sync_pending', JSON.stringify(syncPayload));
  },
};

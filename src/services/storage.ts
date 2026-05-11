import type { Transaction } from '../types';

const DB_NAME = 'gofinancial-db';
const DB_VERSION = 2;
const STORE_NAME = 'transactions';
const LS_KEY = 'gofinancial_transactions';

let dbPromise: Promise<IDBDatabase> | null = null;

async function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  try {
    dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        dbPromise = null;
        reject(request.error);
      };

      request.onupgradeneeded = (event) => {
        const db = request.result;
        const oldVersion = event.oldVersion;

        if (oldVersion < 1) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('categoryId', 'categoryId', { unique: false });
        }

        if (oldVersion < 2) {
          const store = event.currentTarget instanceof IDBOpenDBRequest
            ? (event.currentTarget as IDBOpenDBRequest).transaction?.objectStore(STORE_NAME)
            : request.transaction?.objectStore(STORE_NAME);
          if (store && !store.indexNames.contains('categoryId')) {
            store.createIndex('categoryId', 'categoryId', { unique: false });
          }
        }
      };

      request.onsuccess = () => resolve(request.result);
    });
    return dbPromise;
  } catch (err) {
    dbPromise = null;
    throw err;
  }
}

function lsGetAll(): Transaction[] {
  try {
    const data = localStorage.getItem(LS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function lsSetAll(txns: Transaction[]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(txns));
  } catch {
    // storage full or unavailable — silently degrade
  }
}

export async function addTransaction(transaction: Transaction): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.add(transaction);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    const txns = lsGetAll();
    txns.unshift(transaction);
    lsSetAll(txns);
  }
}

export async function getTransactions(): Promise<Transaction[]> {
  try {
    const db = await openDB();
    return await new Promise<Transaction[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return lsGetAll();
  }
}

export async function deleteTransaction(id: string): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    const txns = lsGetAll().filter(t => t.id !== id);
    lsSetAll(txns);
  }
}

export async function updateTransaction(transaction: Transaction): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(transaction);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    const txns = lsGetAll().map(t => t.id === transaction.id ? transaction : t);
    lsSetAll(txns);
  }
}

export async function getTransactionsByCategory(categoryId: string): Promise<Transaction[]> {
  try {
    const db = await openDB();
    return await new Promise<Transaction[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('categoryId');
      const request = index.getAll(categoryId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return lsGetAll().filter(t => t.categoryId === categoryId);
  }
}

// Cloud sync hooks for Phase 2
export const IDBTransactionStorage = {
  async syncToCloud(userId: string, transactions: Transaction[], categories: Array<{ id: string; name: string; icon: string }>): Promise<void> {
    const syncPayload = { userId, transactions, categories, syncedAt: new Date().toISOString() };
    localStorage.setItem('sync_pending', JSON.stringify(syncPayload));
  },
};

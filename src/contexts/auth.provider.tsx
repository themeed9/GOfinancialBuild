import { useCallback, useEffect, useMemo, useState } from 'react';
import type { User } from '../types';
import { authService } from '../services/api';
import { useTransactions } from '../hooks/useTransactions';
import { IDBTransactionStorage } from '../services/storage';
import { AuthContext } from './auth.context';
import type { AuthState } from './auth.context';

const LOCAL_USERS_KEY = 'gofinancial_users';
const LOCAL_SESSION_KEY = 'gofinancial_session';

interface LocalUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  currency: string;
  locale: string;
  createdAt: string;
}

function getLocalUsers(): LocalUser[] {
  try {
    const data = localStorage.getItem(LOCAL_USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLocalUsers(users: LocalUser[]): void {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { transactions } = useTransactions();

  useEffect(() => {
    let cancelled = false;
    async function init() {
      let foundLocal = false;
      try {
        const session = localStorage.getItem(LOCAL_SESSION_KEY);
        if (session) {
          const users = getLocalUsers();
          const found = users.find(u => u.id === session);
          if (found && !cancelled) {
            foundLocal = true;
            setUser({
              id: found.id,
              username: found.name,
              fullName: found.name,
              email: found.email,
              profileImage: null,
              currency: found.currency,
              locale: found.locale,
              theme: 'light',
              createdAt: new Date(found.createdAt).getTime(),
              name: found.name,
            });
          }
        }

        if (!cancelled && !foundLocal) {
          const currentUser = await authService.getCurrentUser();
          if (!cancelled && currentUser) setUser(currentUser);
        }
      } catch {
        // Offline or no cloud session
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    init();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (user) {
      IDBTransactionStorage.syncToCloud(user.id, transactions, []).catch(console.error);
    }
  }, [user, transactions]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { user: loggedInUser } = await authService.login(email, password);
      setUser(loggedInUser);
      return;
    } catch {
      // Fallback to local auth
    }

    const users = getLocalUsers();
    const passwordHash = await hashPassword(password);
    const found = users.find(u => u.email === email && u.passwordHash === passwordHash);
    if (!found) throw new Error('Invalid credentials');

    localStorage.setItem(LOCAL_SESSION_KEY, found.id);
    setUser({
      id: found.id,
      username: found.name,
      fullName: found.name,
      email: found.email,
      profileImage: null,
      currency: found.currency,
      locale: found.locale,
      theme: 'light',
      createdAt: new Date(found.createdAt).getTime(),
      name: found.name,
    });
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    try {
      const { user: newUser } = await authService.register(email, password, name);
      setUser(newUser);
      return;
    } catch (err) {
      if (err instanceof TypeError) {
        // Network error — fallback to local auth
      } else if (err instanceof Error) {
        if (err.message.toLowerCase().includes('already exists')) {
          throw new Error('This email has already been used');
        }
        // API/validation error — surface the reason to the user
        throw err;
      }
    }

    const users = getLocalUsers();
    if (users.find(u => u.email === email)) throw new Error('This email has already been used');
    const passwordHash = await hashPassword(password);

    const newUser: LocalUser = {
      id: generateId(),
      email,
      passwordHash,
      name,
      currency: 'NGN',
      locale: 'en-NG',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveLocalUsers(users);
    localStorage.setItem(LOCAL_SESSION_KEY, newUser.id);

    setUser({
      id: newUser.id,
      username: newUser.name,
      fullName: newUser.name,
      email: newUser.email,
      profileImage: null,
      currency: newUser.currency,
      locale: newUser.locale,
      theme: 'light',
      createdAt: new Date(newUser.createdAt).getTime(),
      name: newUser.name,
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    }
    localStorage.removeItem(LOCAL_SESSION_KEY);
    setUser(null);
  }, []);

  const isAuth = !!user;

  const value = useMemo<AuthState>(() => ({
    user,
    isAuthenticated: isAuth,
    isLoading,
    login,
    register,
    logout,
  }), [user, isAuth, isLoading, login, register, logout]);

  return <AuthContext value={value}>{children}</AuthContext>;
}

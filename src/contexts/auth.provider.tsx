import { useCallback, useEffect, useMemo, useState } from 'react';
import type { User } from '../types/auth';
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
  password: string;
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
              email: found.email,
              name: found.name,
              currency: found.currency,
              locale: found.locale,
              createdAt: found.createdAt,
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
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) throw new Error('Invalid credentials');

    localStorage.setItem(LOCAL_SESSION_KEY, found.id);
    setUser({
      id: found.id,
      email: found.email,
      name: found.name,
      currency: found.currency,
      locale: found.locale,
      createdAt: found.createdAt,
    });
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    try {
      const { user: newUser } = await authService.register(email, password, name);
      setUser(newUser);
      return;
    } catch {
      // Fallback to local auth
    }

    const users = getLocalUsers();
    if (users.find(u => u.email === email)) throw new Error('Email already exists');

    const newUser: LocalUser = {
      id: generateId(),
      email,
      password,
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
      email: newUser.email,
      name: newUser.name,
      currency: newUser.currency,
      locale: newUser.locale,
      createdAt: newUser.createdAt,
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

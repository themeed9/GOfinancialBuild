import { useCallback, useEffect, useMemo, useState } from 'react';
import type { User } from '../types/auth';
import { authService } from '../services/api';
import { useTransactions } from '../hooks/useTransactions';
import { IDBTransactionStorage } from '../services/storage';
import { AuthContext } from './auth.context';
import type { AuthState } from './auth.context';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { transactions } = useTransactions();
  const isAuth = !!user || !!localStorage.getItem('auth_token');

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const currentUser = await authService.getCurrentUser();
        if (!cancelled && currentUser) setUser(currentUser);
      } catch {
        // Token invalid or offline, continue with local data
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    init();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (user && isAuth) {
      IDBTransactionStorage.syncToCloud(user.id, transactions, []).catch(console.error);
    }
  }, [user, isAuth, transactions]);

  const login = useCallback(async (email: string, password: string) => {
    const { user: loggedInUser } = await authService.login(email, password);
    setUser(loggedInUser);
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const { user: newUser } = await authService.register(email, password, name);
    setUser(newUser);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

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

import { createContext } from 'react';

export interface AuthState {
  user: {
    id: string;
    email: string | null;
    name?: string;
    currency: string;
    locale: string;
    createdAt: number;
  } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthState | undefined>(undefined);

import type { User } from '../types';
import type { SessionToken } from '../types/auth';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.gofinancial.app/v1';

// API request helper with automatic token injection
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('auth_token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers as Record<string, string>,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `API Error: ${response.status}`);
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body: Record<string, unknown>) =>
    apiRequest<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: Record<string, unknown>) =>
    apiRequest<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'DELETE' }),
};

// Auth service functions
export const authService = {
  async login(email: string, password: string): Promise<{ user: User; token: SessionToken }> {
    const data = await api.post<{ user: User; token: SessionToken }>('/auth/login', { email, password });
    localStorage.setItem('auth_token', data.token.accessToken);
    return data;
  },

  async register(email: string, password: string, name: string): Promise<{ user: User; token: SessionToken }> {
    const data = await api.post<{ user: User; token: SessionToken }>('/auth/register', { email, password, name });
    localStorage.setItem('auth_token', data.token.accessToken);
    return data;
  },

  async logout(): Promise<void> {
    localStorage.removeItem('auth_token');
    // Future: await api.post('/auth/logout', {});
  },

  async refresh(): Promise<SessionToken> {
    const data = await api.post<{ token: SessionToken }>('/auth/refresh', {});
    localStorage.setItem('auth_token', data.token.accessToken);
    return data.token;
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      return await api.get<User>('/auth/me');
    } catch {
      return null;
    }
  },
};

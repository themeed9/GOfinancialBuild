export interface User {
  id: string;
  email: string | null;
  name: string;
  currency: string;
  locale: string;
  createdAt: string;
}

export interface SessionToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

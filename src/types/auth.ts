import type { User } from '.';

export type AuthUser = Pick<User, 'id' | 'email' | 'currency' | 'locale' | 'createdAt'> & { name: string };

export interface SessionToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

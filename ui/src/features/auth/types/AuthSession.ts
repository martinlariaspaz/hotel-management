import type { AuthUser } from './AuthUser';

export type AuthSession = {
  token: string;
  expiresAt: string;
  user: AuthUser;
};

export type { AuthSession as default };

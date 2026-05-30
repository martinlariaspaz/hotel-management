import type { AuthSession } from '../types';

export type LoginCredentials = {
  username: string;
  password: string;
};

export type AuthRepository = {
  login(credentials: LoginCredentials): Promise<AuthSession>;
  refresh(token: string): Promise<AuthSession>;
  logout(token: string): Promise<void>;
};

export type { AuthRepository as default };

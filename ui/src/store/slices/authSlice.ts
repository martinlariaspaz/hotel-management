import type { StateCreator } from 'zustand';
import type { AuthSession, AuthUser } from '../../features/auth/types';
import {
  clearStoredAuthToken,
  readStoredAuthToken,
  storeAuthToken,
} from '../../features/auth/utils';

export type AuthStatus = 'anonymous' | 'authenticated' | 'checking';

export type AuthState = {
  token: string | null;
  user: AuthUser | null;
  expiresAt: string | null;
  status: AuthStatus;
};

export type AuthSlice = {
  auth: AuthState;
  setAuthSession(session: AuthSession): void;
  clearAuthSession(): void;
  setAuthStatus(status: AuthStatus): void;
};

const storedToken = readStoredAuthToken();

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  auth: {
    token: storedToken,
    user: null,
    expiresAt: null,
    status: storedToken ? 'checking' : 'anonymous',
  },
  setAuthSession: (session) => {
    storeAuthToken(session.token);

    set({
      auth: {
        token: session.token,
        user: session.user,
        expiresAt: session.expiresAt,
        status: 'authenticated',
      },
    });
  },
  clearAuthSession: () => {
    clearStoredAuthToken();

    set({
      auth: {
        token: null,
        user: null,
        expiresAt: null,
        status: 'anonymous',
      },
    });
  },
  setAuthStatus: (status) => {
    set((state) => ({
      auth: {
        ...state.auth,
        status,
      },
    }));
  },
});

export default createAuthSlice;

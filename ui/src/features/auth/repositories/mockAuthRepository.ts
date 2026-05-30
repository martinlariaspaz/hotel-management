import type {
  AuthRepository,
  LoginCredentials,
} from './AuthRepository';
import type { AuthSession } from '../types';

const MOCK_SESSION_DURATION_MS = 60 * 60 * 1000;

function createMockSession(credentials: LoginCredentials): AuthSession {
  return {
    expiresAt: new Date(Date.now() + MOCK_SESSION_DURATION_MS).toISOString(),
    token: 'mock-auth-token',
    user: {
      id: 'mock-admin',
      role: 'admin',
      username: credentials.username,
    },
  };
}

export function createMockAuthRepository(): AuthRepository {
  return {
    async login(credentials: LoginCredentials): Promise<AuthSession> {
      if (!credentials.username.trim() || !credentials.password.trim()) {
        throw new Error('Invalid credentials');
      }

      return createMockSession(credentials);
    },

    async logout(): Promise<void> {
      return undefined;
    },

    async refresh(token: string): Promise<AuthSession> {
      return createMockSession({
        password: token,
        username: 'mock.admin',
      });
    },
  };
}

export default createMockAuthRepository;

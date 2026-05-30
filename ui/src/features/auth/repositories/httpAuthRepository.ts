import type {
  AuthRepository,
  LoginCredentials,
} from './AuthRepository';
import type { AuthSession } from '../types';
import { parseApiErrorResponse } from '../../../repositories/apiErrors';

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw await parseApiErrorResponse(response);
  }

  return (await response.json()) as T;
}

function createAuthHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export function createHttpAuthRepository(apiUrl: string): AuthRepository {
  return {
    async login(credentials: LoginCredentials): Promise<AuthSession> {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      return parseJsonResponse<AuthSession>(response);
    },

    async refresh(token: string): Promise<AuthSession> {
      const response = await fetch(`${apiUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: createAuthHeaders(token),
      });

      return parseJsonResponse<AuthSession>(response);
    },

    async logout(token: string): Promise<void> {
      const response = await fetch(`${apiUrl}/api/auth/logout`, {
        method: 'POST',
        headers: createAuthHeaders(token),
      });

      if (!response.ok) {
        throw await parseApiErrorResponse(response);
      }
    },
  };
}

export default createHttpAuthRepository;

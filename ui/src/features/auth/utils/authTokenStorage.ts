const AUTH_TOKEN_STORAGE_KEY = 'hotel-management.auth.token';

function canUseStorage(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return Boolean(window.localStorage);
  } catch {
    return false;
  }
}

export function readStoredAuthToken(): string | null {
  if (!canUseStorage()) {
    return null;
  }

  try {
    return window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function storeAuthToken(token: string): void {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }
}

export function clearStoredAuthToken(): void {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }
}

const authTokenStorage = {
  clearStoredAuthToken,
  readStoredAuthToken,
  storeAuthToken,
};

export default authTokenStorage;

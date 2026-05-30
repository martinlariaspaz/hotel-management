import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRepositories } from '../../../repositories';
import { useAppStore } from '../../../store';
import type { LoginCredentials } from '../repositories';

const attemptedRefreshTokens = new Set<string>();

export function useAuth() {
  const { authRepository } = useRepositories();
  const queryClient = useQueryClient();
  const auth = useAppStore((state) => state.auth);
  const setAuthSession = useAppStore((state) => state.setAuthSession);
  const clearAuthSession = useAppStore((state) => state.clearAuthSession);

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      authRepository.login(credentials),
    onSuccess: (session) => {
      setAuthSession(session);
    },
  });
  const refreshMutation = useMutation({
    mutationFn: (token: string) => authRepository.refresh(token),
    onError: () => {
      clearAuthSession();
    },
    onSuccess: (session) => {
      setAuthSession(session);
    },
  });
  const logoutMutation = useMutation({
    mutationFn: async () => {
      if (!auth.token) {
        return;
      }

      await authRepository.logout(auth.token);
    },
    onSettled: () => {
      queryClient.clear();
      clearAuthSession();
    },
  });

  const loginError =
    loginMutation.error instanceof Error ? loginMutation.error.message : null;
  const shouldRefreshSession = auth.status === 'checking' && Boolean(auth.token);
  const millisecondsUntilExpiration = auth.expiresAt
    ? new Date(auth.expiresAt).getTime() - Date.now()
    : null;

  async function login(credentials: LoginCredentials): Promise<void> {
    await loginMutation.mutateAsync(credentials);
  }

  async function logout(): Promise<void> {
    await logoutMutation.mutateAsync();
  }

  useEffect(() => {
    if (!shouldRefreshSession || !auth.token) {
      return;
    }

    if (attemptedRefreshTokens.has(auth.token)) {
      return;
    }

    attemptedRefreshTokens.add(auth.token);
    refreshMutation.mutate(auth.token);
  }, [auth.token, refreshMutation, shouldRefreshSession]);

  useEffect(() => {
    if (auth.status !== 'authenticated' || millisecondsUntilExpiration === null) {
      return;
    }

    if (millisecondsUntilExpiration <= 0) {
      clearAuthSession();
      return;
    }

    const timeoutId = window.setTimeout(
      clearAuthSession,
      millisecondsUntilExpiration,
    );

    return () => window.clearTimeout(timeoutId);
  }, [
    auth.status,
    clearAuthSession,
    millisecondsUntilExpiration,
  ]);

  return {
    authStatus: auth.status,
    user: auth.user,
    login,
    logout,
    loginError,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}

export default useAuth;

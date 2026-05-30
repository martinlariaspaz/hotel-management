import { useQuery } from '@tanstack/react-query';
import { useRepositories } from '../../../repositories';
import type { HealthState } from '../types';
import healthQueryKeys from './healthQueryKeys';

export type UseHealthStatusResult = {
  healthState: HealthState;
  isRefreshing: boolean;
  lastCheckedAt: string | null;
  refresh(): void;
};

function useHealthStatus(): UseHealthStatusResult {
  const { healthRepository } = useRepositories();

  const healthQuery = useQuery({
    queryFn: () => healthRepository.check(),
    queryKey: healthQueryKeys.status,
    retry: false,
  });

  const healthState: HealthState = healthQuery.isLoading
    ? 'checking'
    : healthQuery.data?.status ?? (healthQuery.isError ? 'offline' : 'checking');
  const errorCheckedAt = healthQuery.errorUpdatedAt
    ? new Date(healthQuery.errorUpdatedAt).toISOString()
    : null;
  const lastCheckedAt = healthQuery.data?.checkedAt ?? errorCheckedAt;
  const isRefreshing = healthQuery.isFetching;

  function refresh(): void {
    void healthQuery.refetch();
  }

  return {
    healthState,
    isRefreshing,
    lastCheckedAt,
    refresh,
  };
}

export default useHealthStatus;

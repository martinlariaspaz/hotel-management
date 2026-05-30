import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRepositories } from '../../../repositories';
import { useAppStore } from '../../../store';
import { roomQueryKeys } from '../../rooms';
import type {
  CreateMaintenanceBlockInput,
  MaintenanceBlockListFilters,
} from '../repositories';
import type { MaintenanceBlock } from '../types';
import maintenanceBlockQueryKeys from './maintenanceBlockQueryKeys';

export type UseMaintenanceBlocksOptions = {
  enabled?: boolean;
};

export type UseMaintenanceBlocksResult = {
  cancelError: unknown;
  cancelMaintenanceBlock(maintenanceBlockId: string): Promise<MaintenanceBlock>;
  createError: unknown;
  createMaintenanceBlock(
    input: CreateMaintenanceBlockInput,
  ): Promise<MaintenanceBlock>;
  isCancelling: boolean;
  isCreating: boolean;
  isLoading: boolean;
  listError: unknown;
  maintenanceBlocks: MaintenanceBlock[];
};

function requireAuthToken(token: string | null): string {
  if (!token) {
    throw new Error('Authentication token is required');
  }

  return token;
}

function useMaintenanceBlocks(
  filters: MaintenanceBlockListFilters = {},
  options: UseMaintenanceBlocksOptions = {},
): UseMaintenanceBlocksResult {
  const { maintenanceBlockRepository } = useRepositories();
  const token = useAppStore((state) => state.auth.token);
  const queryClient = useQueryClient();
  const enabled = options.enabled ?? true;
  const maintenanceBlocksQuery = useQuery({
    enabled: Boolean(token) && enabled,
    queryFn: () =>
      maintenanceBlockRepository.listMaintenanceBlocks(
        requireAuthToken(token),
        filters,
      ),
    queryKey: maintenanceBlockQueryKeys.list(filters),
  });
  const createMutation = useMutation({
    mutationFn: (input: CreateMaintenanceBlockInput) =>
      maintenanceBlockRepository.createMaintenanceBlock(
        requireAuthToken(token),
        input,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: maintenanceBlockQueryKeys.all,
      });
      void queryClient.invalidateQueries({ queryKey: roomQueryKeys.all });
    },
  });
  const cancelMutation = useMutation({
    mutationFn: (maintenanceBlockId: string) =>
      maintenanceBlockRepository.cancelMaintenanceBlock(
        requireAuthToken(token),
        maintenanceBlockId,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: maintenanceBlockQueryKeys.all,
      });
      void queryClient.invalidateQueries({ queryKey: roomQueryKeys.all });
    },
  });

  const maintenanceBlocks = maintenanceBlocksQuery.data ?? [];

  async function createMaintenanceBlock(
    input: CreateMaintenanceBlockInput,
  ): Promise<MaintenanceBlock> {
    return createMutation.mutateAsync(input);
  }

  async function cancelMaintenanceBlock(
    maintenanceBlockId: string,
  ): Promise<MaintenanceBlock> {
    return cancelMutation.mutateAsync(maintenanceBlockId);
  }

  return {
    cancelError: cancelMutation.error,
    cancelMaintenanceBlock,
    createError: createMutation.error,
    createMaintenanceBlock,
    isCancelling: cancelMutation.isPending,
    isCreating: createMutation.isPending,
    isLoading: maintenanceBlocksQuery.isLoading,
    listError: maintenanceBlocksQuery.error,
    maintenanceBlocks,
  };
}

export default useMaintenanceBlocks;

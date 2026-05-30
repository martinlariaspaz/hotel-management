import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRepositories } from '../../../repositories';
import { useAppStore } from '../../../store';
import type {
  CreateStaffUserInput,
  UpdateStaffUserInput,
} from '../repositories';
import type { StaffUser } from '../types';
import staffQueryKeys from './staffQueryKeys';

export type UseStaffUsersResult = {
  createError: unknown;
  createStaffUser(input: CreateStaffUserInput): Promise<StaffUser>;
  isCreating: boolean;
  isLoading: boolean;
  isUpdating: boolean;
  listError: unknown;
  updateError: unknown;
  updateStaffUser(
    staffUserId: string,
    input: UpdateStaffUserInput,
  ): Promise<StaffUser>;
  users: StaffUser[];
};

function requireAuthToken(token: string | null): string {
  if (!token) {
    throw new Error('Authentication token is required');
  }

  return token;
}

function useStaffUsers(): UseStaffUsersResult {
  const { staffRepository } = useRepositories();
  const token = useAppStore((state) => state.auth.token);
  const queryClient = useQueryClient();
  const staffUsersQuery = useQuery({
    enabled: Boolean(token),
    queryFn: () => staffRepository.listStaffUsers(requireAuthToken(token)),
    queryKey: staffQueryKeys.lists,
  });
  const createMutation = useMutation({
    mutationFn: (input: CreateStaffUserInput) =>
      staffRepository.createStaffUser(requireAuthToken(token), input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: staffQueryKeys.lists });
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({
      input,
      staffUserId,
    }: {
      input: UpdateStaffUserInput;
      staffUserId: string;
    }) =>
      staffRepository.updateStaffUser(
        requireAuthToken(token),
        staffUserId,
        input,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: staffQueryKeys.lists });
    },
  });

  const users = staffUsersQuery.data ?? [];

  async function createStaffUser(
    input: CreateStaffUserInput,
  ): Promise<StaffUser> {
    return createMutation.mutateAsync(input);
  }

  async function updateStaffUser(
    staffUserId: string,
    input: UpdateStaffUserInput,
  ): Promise<StaffUser> {
    return updateMutation.mutateAsync({ staffUserId, input });
  }

  return {
    createError: createMutation.error,
    createStaffUser,
    isCreating: createMutation.isPending,
    isLoading: staffUsersQuery.isLoading,
    isUpdating: updateMutation.isPending,
    listError: staffUsersQuery.error,
    updateError: updateMutation.error,
    updateStaffUser,
    users,
  };
}

export default useStaffUsers;

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRepositories } from '../../../repositories';
import { useAppStore } from '../../../store';
import type {
  CreateRoomTypeInput,
  UpdateRoomTypeInput,
} from '../repositories';
import type { RoomType } from '../types';
import roomTypeQueryKeys from './roomTypeQueryKeys';

export type UseRoomTypesResult = {
  createError: unknown;
  createRoomType(input: CreateRoomTypeInput): Promise<RoomType>;
  deactivateError: unknown;
  deactivateRoomType(roomTypeId: string): Promise<RoomType>;
  isCreating: boolean;
  isDeactivating: boolean;
  isLoading: boolean;
  isUpdating: boolean;
  listError: unknown;
  roomTypes: RoomType[];
  updateError: unknown;
  updateRoomType(
    roomTypeId: string,
    input: UpdateRoomTypeInput,
  ): Promise<RoomType>;
};

function requireAuthToken(token: string | null): string {
  if (!token) {
    throw new Error('Authentication token is required');
  }

  return token;
}

function useRoomTypes(): UseRoomTypesResult {
  const { roomTypeRepository } = useRepositories();
  const token = useAppStore((state) => state.auth.token);
  const queryClient = useQueryClient();
  const roomTypesQuery = useQuery({
    enabled: Boolean(token),
    queryFn: () => roomTypeRepository.listRoomTypes(requireAuthToken(token)),
    queryKey: roomTypeQueryKeys.lists,
  });
  const createMutation = useMutation({
    mutationFn: (input: CreateRoomTypeInput) =>
      roomTypeRepository.createRoomType(requireAuthToken(token), input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: roomTypeQueryKeys.all });
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({
      input,
      roomTypeId,
    }: {
      input: UpdateRoomTypeInput;
      roomTypeId: string;
    }) =>
      roomTypeRepository.updateRoomType(
        requireAuthToken(token),
        roomTypeId,
        input,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: roomTypeQueryKeys.all });
    },
  });
  const deactivateMutation = useMutation({
    mutationFn: (roomTypeId: string) =>
      roomTypeRepository.deactivateRoomType(
        requireAuthToken(token),
        roomTypeId,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: roomTypeQueryKeys.all });
    },
  });

  const roomTypes = roomTypesQuery.data ?? [];

  async function createRoomType(
    input: CreateRoomTypeInput,
  ): Promise<RoomType> {
    return createMutation.mutateAsync(input);
  }

  async function deactivateRoomType(roomTypeId: string): Promise<RoomType> {
    return deactivateMutation.mutateAsync(roomTypeId);
  }

  async function updateRoomType(
    roomTypeId: string,
    input: UpdateRoomTypeInput,
  ): Promise<RoomType> {
    return updateMutation.mutateAsync({ roomTypeId, input });
  }

  return {
    createError: createMutation.error,
    createRoomType,
    deactivateError: deactivateMutation.error,
    deactivateRoomType,
    isCreating: createMutation.isPending,
    isDeactivating: deactivateMutation.isPending,
    isLoading: roomTypesQuery.isLoading,
    isUpdating: updateMutation.isPending,
    listError: roomTypesQuery.error,
    roomTypes,
    updateError: updateMutation.error,
    updateRoomType,
  };
}

export default useRoomTypes;


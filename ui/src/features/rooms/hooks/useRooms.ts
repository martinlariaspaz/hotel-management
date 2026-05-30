import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRepositories } from '../../../repositories';
import { useAppStore } from '../../../store';
import type { RoomStatus } from '../../statuses';
import type {
  CreateRoomInput,
  RoomListFilters,
  UpdateRoomInput,
} from '../repositories';
import type { Room } from '../types';
import roomQueryKeys from './roomQueryKeys';

export type UseRoomsResult = {
  createError: unknown;
  createRoom(input: CreateRoomInput): Promise<Room>;
  isCreating: boolean;
  isLoading: boolean;
  isStatusUpdating: boolean;
  isUpdating: boolean;
  listError: unknown;
  rooms: Room[];
  statusUpdateError: unknown;
  updateError: unknown;
  updateRoom(roomId: string, input: UpdateRoomInput): Promise<Room>;
  updateRoomStatus(roomId: string, status: RoomStatus): Promise<Room>;
};

function requireAuthToken(token: string | null): string {
  if (!token) {
    throw new Error('Authentication token is required');
  }

  return token;
}

function useRooms(filters: RoomListFilters = {}): UseRoomsResult {
  const { roomRepository } = useRepositories();
  const token = useAppStore((state) => state.auth.token);
  const queryClient = useQueryClient();
  const roomsQuery = useQuery({
    enabled: Boolean(token),
    queryFn: () =>
      roomRepository.listRooms(requireAuthToken(token), filters),
    queryKey: roomQueryKeys.list(filters),
  });
  const createMutation = useMutation({
    mutationFn: (input: CreateRoomInput) =>
      roomRepository.createRoom(requireAuthToken(token), input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: roomQueryKeys.all });
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({
      input,
      roomId,
    }: {
      input: UpdateRoomInput;
      roomId: string;
    }) => roomRepository.updateRoom(requireAuthToken(token), roomId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: roomQueryKeys.all });
    },
  });
  const statusMutation = useMutation({
    mutationFn: ({
      roomId,
      status,
    }: {
      roomId: string;
      status: RoomStatus;
    }) =>
      roomRepository.updateRoomStatus(
        requireAuthToken(token),
        roomId,
        status,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: roomQueryKeys.all });
    },
  });

  const rooms = roomsQuery.data ?? [];

  async function createRoom(input: CreateRoomInput): Promise<Room> {
    return createMutation.mutateAsync(input);
  }

  async function updateRoom(
    roomId: string,
    input: UpdateRoomInput,
  ): Promise<Room> {
    return updateMutation.mutateAsync({ roomId, input });
  }

  async function updateRoomStatus(
    roomId: string,
    status: RoomStatus,
  ): Promise<Room> {
    return statusMutation.mutateAsync({ roomId, status });
  }

  return {
    createError: createMutation.error,
    createRoom,
    isCreating: createMutation.isPending,
    isLoading: roomsQuery.isLoading,
    isStatusUpdating: statusMutation.isPending,
    isUpdating: updateMutation.isPending,
    listError: roomsQuery.error,
    rooms,
    statusUpdateError: statusMutation.error,
    updateError: updateMutation.error,
    updateRoom,
    updateRoomStatus,
  };
}

export default useRooms;


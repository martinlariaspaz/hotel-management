import { useQuery } from '@tanstack/react-query';
import { useRepositories } from '../../../repositories';
import type { RoomType } from '../types';
import roomTypeQueryKeys from './roomTypeQueryKeys';

export type UseActiveRoomTypesResult = {
  activeRoomTypes: RoomType[];
  isLoading: boolean;
  listError: unknown;
};

function useActiveRoomTypes(enabled = true): UseActiveRoomTypesResult {
  const { roomTypeRepository } = useRepositories();
  const roomTypesQuery = useQuery({
    enabled,
    queryFn: () => roomTypeRepository.listActiveRoomTypes(),
    queryKey: roomTypeQueryKeys.activeLists,
  });
  const activeRoomTypes = roomTypesQuery.data ?? [];

  return {
    activeRoomTypes,
    isLoading: roomTypesQuery.isLoading,
    listError: roomTypesQuery.error,
  };
}

export default useActiveRoomTypes;

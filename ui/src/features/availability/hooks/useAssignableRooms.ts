import { useQuery } from '@tanstack/react-query';
import { useRepositories } from '../../../repositories';
import { useAppStore } from '../../../store';
import { isAvailabilitySearchCriteriaValid } from '../business';
import type {
  AssignableRoom,
  AssignableRoomSearchCriteria,
} from '../types';
import availabilityQueryKeys from './availabilityQueryKeys';

export type UseAssignableRoomsOptions = {
  enabled?: boolean;
};

export type UseAssignableRoomsResult = {
  assignableRooms: AssignableRoom[];
  isCriteriaValid: boolean;
  isLoading: boolean;
  listError: unknown;
};

function requireAuthToken(token: string | null): string {
  if (!token) {
    throw new Error('Authentication token is required');
  }

  return token;
}

function isAssignableRoomSearchCriteriaValid(
  criteria: AssignableRoomSearchCriteria,
): boolean {
  return (
    criteria.roomTypeId.trim().length > 0 &&
    isAvailabilitySearchCriteriaValid(criteria)
  );
}

function useAssignableRooms(
  criteria: AssignableRoomSearchCriteria,
  options: UseAssignableRoomsOptions = {},
): UseAssignableRoomsResult {
  const { availabilityRepository } = useRepositories();
  const token = useAppStore((state) => state.auth.token);
  const isCriteriaValid = isAssignableRoomSearchCriteriaValid(criteria);
  const enabled = Boolean(token) && (options.enabled ?? true) && isCriteriaValid;
  const assignableRoomsQuery = useQuery({
    enabled,
    queryFn: () =>
      availabilityRepository.listAssignableRooms(
        requireAuthToken(token),
        criteria,
      ),
    queryKey: availabilityQueryKeys.assignableRooms(criteria),
  });

  const assignableRooms = assignableRoomsQuery.data ?? [];

  return {
    assignableRooms,
    isCriteriaValid,
    isLoading: assignableRoomsQuery.isLoading,
    listError: assignableRoomsQuery.error,
  };
}

export default useAssignableRooms;

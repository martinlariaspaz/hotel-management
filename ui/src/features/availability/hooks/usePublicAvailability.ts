import { useQuery } from '@tanstack/react-query';
import { useRepositories } from '../../../repositories';
import { isAvailabilitySearchCriteriaValid } from '../business';
import type {
  AvailabilitySearchCriteria,
  PublicRoomTypeAvailability,
} from '../types';
import availabilityQueryKeys from './availabilityQueryKeys';

export type UsePublicAvailabilityOptions = {
  enabled?: boolean;
};

export type UsePublicAvailabilityResult = {
  isLoading: boolean;
  isSearchValid: boolean;
  listError: unknown;
  roomTypeAvailability: PublicRoomTypeAvailability[];
};

function usePublicAvailability(
  criteria: AvailabilitySearchCriteria,
  options: UsePublicAvailabilityOptions = {},
): UsePublicAvailabilityResult {
  const { availabilityRepository } = useRepositories();
  const isSearchValid = isAvailabilitySearchCriteriaValid(criteria);
  const enabled = (options.enabled ?? true) && isSearchValid;
  const publicAvailabilityQuery = useQuery({
    enabled,
    queryFn: () => availabilityRepository.searchPublicAvailability(criteria),
    queryKey: availabilityQueryKeys.publicSearch(criteria),
  });

  const roomTypeAvailability = publicAvailabilityQuery.data ?? [];

  return {
    isLoading: publicAvailabilityQuery.isLoading,
    isSearchValid,
    listError: publicAvailabilityQuery.error,
    roomTypeAvailability,
  };
}

export default usePublicAvailability;

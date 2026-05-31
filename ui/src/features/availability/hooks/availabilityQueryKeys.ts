import type {
  AssignableRoomSearchCriteria,
  AvailabilitySearchCriteria,
} from '../types';

const availabilityQueryKeys = {
  all: ['availability'] as const,
  assignableRoomLists: () =>
    [...availabilityQueryKeys.all, 'assignable-rooms'] as const,
  assignableRooms: (criteria: AssignableRoomSearchCriteria) =>
    [
      ...availabilityQueryKeys.assignableRoomLists(),
      criteria.roomTypeId,
      criteria.checkIn,
      criteria.checkOut,
      criteria.guests,
      criteria.reservationId ?? null,
    ] as const,
  publicSearch: (criteria: AvailabilitySearchCriteria) =>
    [
      ...availabilityQueryKeys.publicSearches(),
      criteria.checkIn,
      criteria.checkOut,
      criteria.guests,
    ] as const,
  publicSearches: () =>
    [...availabilityQueryKeys.all, 'public-search'] as const,
};

export default availabilityQueryKeys;

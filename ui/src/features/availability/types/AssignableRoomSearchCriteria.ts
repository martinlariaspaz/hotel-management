import type AvailabilitySearchCriteria from './AvailabilitySearchCriteria';

type AssignableRoomSearchCriteria = AvailabilitySearchCriteria & {
  reservationId?: string;
  roomTypeId: string;
};

export type { AssignableRoomSearchCriteria as default };

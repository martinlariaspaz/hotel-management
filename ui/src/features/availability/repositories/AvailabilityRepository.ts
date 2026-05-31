import type {
  AssignableRoom,
  AssignableRoomSearchCriteria,
  AvailabilitySearchCriteria,
  PublicRoomTypeAvailability,
} from '../types';

export type AvailabilityRepository = {
  listAssignableRooms(
    token: string,
    criteria: AssignableRoomSearchCriteria,
  ): Promise<AssignableRoom[]>;
  searchPublicAvailability(
    criteria: AvailabilitySearchCriteria,
  ): Promise<PublicRoomTypeAvailability[]>;
};

export type { AvailabilityRepository as default };

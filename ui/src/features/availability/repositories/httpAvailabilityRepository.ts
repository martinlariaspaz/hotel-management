import { parseApiErrorResponse } from '../../../repositories/apiErrors';
import type {
  AssignableRoom,
  AssignableRoomSearchCriteria,
  AvailabilitySearchCriteria,
  PublicRoomTypeAvailability,
} from '../types';
import type { AvailabilityRepository } from './AvailabilityRepository';

type PublicAvailabilityResponse = {
  roomTypes: PublicRoomTypeAvailability[];
};

type AssignableRoomsResponse = {
  rooms: AssignableRoom[];
};

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw await parseApiErrorResponse(response);
  }

  return (await response.json()) as T;
}

function createAuthHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
  };
}

function createAvailabilitySearchParams(
  criteria: AvailabilitySearchCriteria,
): URLSearchParams {
  const searchParams = new URLSearchParams();

  searchParams.set('checkIn', criteria.checkIn);
  searchParams.set('checkOut', criteria.checkOut);
  searchParams.set('guests', criteria.guests.toString());

  return searchParams;
}

function createPublicAvailabilityUrl(
  apiUrl: string,
  criteria: AvailabilitySearchCriteria,
): string {
  const queryString = createAvailabilitySearchParams(criteria).toString();

  return `${apiUrl}/api/availability/public?${queryString}`;
}

function createAssignableRoomsUrl(
  apiUrl: string,
  criteria: AssignableRoomSearchCriteria,
): string {
  const searchParams = createAvailabilitySearchParams(criteria);

  searchParams.set('roomTypeId', criteria.roomTypeId);

  if (criteria.reservationId) {
    searchParams.set('reservationId', criteria.reservationId);
  }

  return `${apiUrl}/api/availability/assignable-rooms?${searchParams.toString()}`;
}

export function createHttpAvailabilityRepository(
  apiUrl: string,
): AvailabilityRepository {
  return {
    async listAssignableRooms(token, criteria) {
      const response = await fetch(createAssignableRoomsUrl(apiUrl, criteria), {
        headers: createAuthHeaders(token),
      });
      const assignableRoomsResponse =
        await parseJsonResponse<AssignableRoomsResponse>(response);

      return assignableRoomsResponse.rooms;
    },

    async searchPublicAvailability(criteria) {
      const response = await fetch(
        createPublicAvailabilityUrl(apiUrl, criteria),
      );
      const availabilityResponse =
        await parseJsonResponse<PublicAvailabilityResponse>(response);

      return availabilityResponse.roomTypes;
    },
  };
}

export default createHttpAvailabilityRepository;

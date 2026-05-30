import { parseApiErrorResponse } from '../../../repositories/apiErrors';
import type { RoomStatus } from '../../statuses';
import type {
  CreateRoomInput,
  RoomListFilters,
  RoomRepository,
  UpdateRoomInput,
} from './RoomRepository';
import type { Room } from '../types';

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw await parseApiErrorResponse(response);
  }

  return (await response.json()) as T;
}

function createJsonHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

function createAuthHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
  };
}

function createRoomsUrl(apiUrl: string, filters?: RoomListFilters): string {
  const searchParams = new URLSearchParams();

  if (filters?.status) {
    searchParams.set('status', filters.status);
  }

  if (filters?.roomTypeId) {
    searchParams.set('roomTypeId', filters.roomTypeId);
  }

  if (filters?.floor) {
    searchParams.set('floor', filters.floor);
  }

  const queryString = searchParams.toString();

  return `${apiUrl}/api/staff/rooms${queryString ? `?${queryString}` : ''}`;
}

export function createHttpRoomRepository(apiUrl: string): RoomRepository {
  return {
    async createRoom(token: string, input: CreateRoomInput): Promise<Room> {
      const response = await fetch(`${apiUrl}/api/staff/rooms`, {
        method: 'POST',
        headers: createJsonHeaders(token),
        body: JSON.stringify(input),
      });

      return parseJsonResponse<Room>(response);
    },

    async getRoom(token: string, roomId: string): Promise<Room> {
      const response = await fetch(`${apiUrl}/api/staff/rooms/${roomId}`, {
        headers: createAuthHeaders(token),
      });

      return parseJsonResponse<Room>(response);
    },

    async listRooms(
      token: string,
      filters?: RoomListFilters,
    ): Promise<Room[]> {
      const response = await fetch(createRoomsUrl(apiUrl, filters), {
        headers: createAuthHeaders(token),
      });

      return parseJsonResponse<Room[]>(response);
    },

    async updateRoom(
      token: string,
      roomId: string,
      input: UpdateRoomInput,
    ): Promise<Room> {
      const response = await fetch(`${apiUrl}/api/staff/rooms/${roomId}`, {
        method: 'PATCH',
        headers: createJsonHeaders(token),
        body: JSON.stringify(input),
      });

      return parseJsonResponse<Room>(response);
    },

    async updateRoomStatus(
      token: string,
      roomId: string,
      status: RoomStatus,
    ): Promise<Room> {
      const response = await fetch(
        `${apiUrl}/api/staff/rooms/${roomId}/status`,
        {
          method: 'PATCH',
          headers: createJsonHeaders(token),
          body: JSON.stringify({ status }),
        },
      );

      return parseJsonResponse<Room>(response);
    },
  };
}

export default createHttpRoomRepository;


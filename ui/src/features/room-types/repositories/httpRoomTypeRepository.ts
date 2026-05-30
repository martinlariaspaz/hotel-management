import { parseApiErrorResponse } from '../../../repositories/apiErrors';
import type {
  CreateRoomTypeInput,
  RoomTypeRepository,
  UpdateRoomTypeInput,
} from './RoomTypeRepository';
import type { RoomType } from '../types';

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

export function createHttpRoomTypeRepository(
  apiUrl: string,
): RoomTypeRepository {
  return {
    async createRoomType(
      token: string,
      input: CreateRoomTypeInput,
    ): Promise<RoomType> {
      const response = await fetch(`${apiUrl}/api/admin/room-types`, {
        method: 'POST',
        headers: createJsonHeaders(token),
        body: JSON.stringify(input),
      });

      return parseJsonResponse<RoomType>(response);
    },

    async deactivateRoomType(
      token: string,
      roomTypeId: string,
    ): Promise<RoomType> {
      const response = await fetch(
        `${apiUrl}/api/admin/room-types/${roomTypeId}/deactivate`,
        {
          method: 'PATCH',
          headers: createJsonHeaders(token),
        },
      );

      return parseJsonResponse<RoomType>(response);
    },

    async getRoomType(token: string, roomTypeId: string): Promise<RoomType> {
      const response = await fetch(
        `${apiUrl}/api/admin/room-types/${roomTypeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return parseJsonResponse<RoomType>(response);
    },

    async listRoomTypes(token: string): Promise<RoomType[]> {
      const response = await fetch(`${apiUrl}/api/admin/room-types`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return parseJsonResponse<RoomType[]>(response);
    },

    async updateRoomType(
      token: string,
      roomTypeId: string,
      input: UpdateRoomTypeInput,
    ): Promise<RoomType> {
      const response = await fetch(
        `${apiUrl}/api/admin/room-types/${roomTypeId}`,
        {
          method: 'PATCH',
          headers: createJsonHeaders(token),
          body: JSON.stringify(input),
        },
      );

      return parseJsonResponse<RoomType>(response);
    },
  };
}

export default createHttpRoomTypeRepository;


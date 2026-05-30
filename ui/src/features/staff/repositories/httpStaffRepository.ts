import { parseApiErrorResponse } from '../../../repositories/apiErrors';
import type {
  CreateStaffUserInput,
  StaffRepository,
  UpdateStaffUserInput,
} from './StaffRepository';
import type { StaffUser } from '../types';

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

export function createHttpStaffRepository(apiUrl: string): StaffRepository {
  return {
    async createStaffUser(
      token: string,
      input: CreateStaffUserInput,
    ): Promise<StaffUser> {
      const response = await fetch(`${apiUrl}/api/staff/users`, {
        method: 'POST',
        headers: createJsonHeaders(token),
        body: JSON.stringify(input),
      });

      return parseJsonResponse<StaffUser>(response);
    },

    async listStaffUsers(token: string): Promise<StaffUser[]> {
      const response = await fetch(`${apiUrl}/api/staff/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return parseJsonResponse<StaffUser[]>(response);
    },

    async updateStaffUser(
      token: string,
      staffUserId: string,
      input: UpdateStaffUserInput,
    ): Promise<StaffUser> {
      const response = await fetch(`${apiUrl}/api/staff/users/${staffUserId}`, {
        method: 'PATCH',
        headers: createJsonHeaders(token),
        body: JSON.stringify(input),
      });

      return parseJsonResponse<StaffUser>(response);
    },
  };
}

export default createHttpStaffRepository;

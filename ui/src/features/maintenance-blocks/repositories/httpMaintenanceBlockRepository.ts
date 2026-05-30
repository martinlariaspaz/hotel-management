import { parseApiErrorResponse } from '../../../repositories/apiErrors';
import type {
  CreateMaintenanceBlockInput,
  MaintenanceBlockListFilters,
  MaintenanceBlockRepository,
} from './MaintenanceBlockRepository';
import type { MaintenanceBlock } from '../types';

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

function createMaintenanceBlocksUrl(
  apiUrl: string,
  filters?: MaintenanceBlockListFilters,
): string {
  const searchParams = new URLSearchParams();

  if (filters?.roomId) {
    searchParams.set('roomId', filters.roomId);
  }

  if (filters?.startDate) {
    searchParams.set('startDate', filters.startDate);
  }

  if (filters?.endDate) {
    searchParams.set('endDate', filters.endDate);
  }

  if (filters?.status) {
    searchParams.set('status', filters.status);
  }

  const queryString = searchParams.toString();

  return `${apiUrl}/api/staff/maintenance-blocks${
    queryString ? `?${queryString}` : ''
  }`;
}

export function createHttpMaintenanceBlockRepository(
  apiUrl: string,
): MaintenanceBlockRepository {
  return {
    async cancelMaintenanceBlock(
      token: string,
      maintenanceBlockId: string,
    ): Promise<MaintenanceBlock> {
      const response = await fetch(
        `${apiUrl}/api/staff/maintenance-blocks/${maintenanceBlockId}/cancel`,
        {
          method: 'PATCH',
          headers: createJsonHeaders(token),
        },
      );

      return parseJsonResponse<MaintenanceBlock>(response);
    },

    async createMaintenanceBlock(
      token: string,
      input: CreateMaintenanceBlockInput,
    ): Promise<MaintenanceBlock> {
      const response = await fetch(`${apiUrl}/api/staff/maintenance-blocks`, {
        method: 'POST',
        headers: createJsonHeaders(token),
        body: JSON.stringify(input),
      });

      return parseJsonResponse<MaintenanceBlock>(response);
    },

    async listMaintenanceBlocks(
      token: string,
      filters?: MaintenanceBlockListFilters,
    ): Promise<MaintenanceBlock[]> {
      const response = await fetch(createMaintenanceBlocksUrl(apiUrl, filters), {
        headers: createAuthHeaders(token),
      });

      return parseJsonResponse<MaintenanceBlock[]>(response);
    },
  };
}

export default createHttpMaintenanceBlockRepository;

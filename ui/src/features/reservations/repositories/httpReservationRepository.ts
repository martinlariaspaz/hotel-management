import { parseApiErrorResponse } from '../../../repositories/apiErrors';
import type { PendingPublicReservation } from '../types';
import type { ReservationRepository } from './ReservationRepository';

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw await parseApiErrorResponse(response);
  }

  return (await response.json()) as T;
}

export function createHttpReservationRepository(
  apiUrl: string,
): ReservationRepository {
  return {
    async createPublicReservation(input) {
      const response = await fetch(`${apiUrl}/api/reservations/public`, {
        body: JSON.stringify(input),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      return parseJsonResponse<PendingPublicReservation>(response);
    },
  };
}

export default createHttpReservationRepository;

import type {
  PendingPublicReservation,
  PublicReservationRequest,
} from '../types';

export type ReservationRepository = {
  createPublicReservation(
    input: PublicReservationRequest,
  ): Promise<PendingPublicReservation>;
};

export type { ReservationRepository as default };

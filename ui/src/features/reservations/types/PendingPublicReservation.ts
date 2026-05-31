import type {
  AvailabilityCancellationPolicy,
  AvailabilityCurrency,
  AvailabilityDepositRule,
  AvailabilityPriceSummary,
  AvailabilityRoomTypeSummary,
} from '../../availability';
import type { ReservationStatus } from '../../statuses';

export type PublicReservationStatus =
  | ReservationStatus
  | 'pending'
  | (string & {});

export type PendingPublicReservationGuest = {
  email: string;
  name: string;
  phone: string;
};

type PendingPublicReservation = {
  cancellationPolicy?: AvailabilityCancellationPolicy | null;
  checkInDate: string;
  checkOutDate: string;
  createdAt: string;
  currency: AvailabilityCurrency;
  depositRule?: AvailabilityDepositRule | null;
  expiresAt?: string | null;
  guest: PendingPublicReservationGuest;
  guestCount: number;
  id: string;
  priceSummary?: AvailabilityPriceSummary | null;
  reference: string;
  roomType: AvailabilityRoomTypeSummary;
  status: PublicReservationStatus;
  totalAmount?: number | null;
};

export type { PendingPublicReservation as default };

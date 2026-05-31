import type { Guest, GuestInput } from '../../guests';
import type { RoomStatus, ReservationStatus } from '../../statuses';

export type ReservationSource = 'public' | 'staff';

export type ReservationCurrency = 'ARS' | (string & {});

export type ReservationRoomTypeSummary = {
  baseNightlyRate?: number;
  capacity: number;
  id: string;
  isActive?: boolean;
  name: string;
};

export type ReservationRoomSummary = {
  floor?: string;
  id: string;
  roomNumber: string;
  status: RoomStatus;
};

export type ReservationTotals = {
  currency: ReservationCurrency;
  totalAmount: number;
};

export type ReservationPolicyAcceptance = {
  policyAccepted: boolean;
  policyAcceptedAt?: string | null;
};

export type Reservation = ReservationTotals &
  ReservationPolicyAcceptance & {
    checkInDate: string;
    checkOutDate: string;
    code?: string | null;
    createdAt: string;
    expiresAt?: string | null;
    expiredAt?: string | null;
    guest: Guest;
    guestCount: number;
    id: string;
    notes?: string;
    policyVersion?: string;
    room?: ReservationRoomSummary | null;
    roomType: ReservationRoomTypeSummary;
    source: ReservationSource;
    status: ReservationStatus;
    updatedAt: string;
  };

export type ReservationCreateBaseInput = {
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  notes?: string;
  roomTypeId: string;
};

export type PublicReservationCreateInput = ReservationCreateBaseInput & {
  guest: GuestInput;
  policyAccepted: true;
};

export type ExistingGuestReservationReference = {
  guest?: never;
  guestId: string;
};

export type NewGuestReservationReference = {
  guest: GuestInput;
  guestId?: never;
};

export type StaffReservationGuestReference =
  | ExistingGuestReservationReference
  | NewGuestReservationReference;

export type StaffReservationCreateInput = ReservationCreateBaseInput &
  StaffReservationGuestReference & {
    currency?: ReservationCurrency;
    policyAccepted?: boolean;
    policyAcceptedAt?: string;
    policyVersion?: string;
    roomId?: string;
    status?: ReservationStatus;
    totalAmount?: number;
  };

export type { Reservation as default };

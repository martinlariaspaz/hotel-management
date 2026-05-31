import type { ReservationStatus } from "../../common/enums";
import type {
  AvailabilityPriceSummary,
  CancellationPolicyData,
  DepositRule,
} from "../../availability/types";
import type { ReservationSource } from "../schemas";

export type PublicReservationGuestSummary = {
  email: string;
  id: string;
  name: string;
  phone: string;
};

export type PublicReservationRoomTypeSummary = {
  amenities: string[];
  baseNightlyRate: number;
  capacity: number;
  id: string;
  name: string;
  photoUrls: string[];
};

export type PublicReservationResponse = {
  cancellationPolicy: CancellationPolicyData;
  checkInDate: string;
  checkOutDate: string;
  createdAt: string;
  currency: string;
  depositRule: DepositRule;
  expiresAt: string;
  guest: PublicReservationGuestSummary;
  guestCount: number;
  id: string;
  priceSummary: AvailabilityPriceSummary;
  reference: string;
  roomType: PublicReservationRoomTypeSummary;
  source: ReservationSource.Public;
  status: ReservationStatus;
  totalAmount: number;
};

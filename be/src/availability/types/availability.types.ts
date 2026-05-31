import type { RoomStatus } from "../../common/enums";

export type AvailabilityPriceSummary = {
  currency: string;
  nightlyRate: number;
  nights: number;
  subtotal: number;
  taxesAndFeesIncluded: boolean;
  total: number;
};

export type DepositRule = {
  amount: number;
  code: string;
  currency: string;
  description: string;
  type: "first_night";
};

export type CancellationPolicyData = {
  code: string;
  description: string;
  freeCancellationUntilHoursBeforeCheckIn: number;
  lateCancellationPenalty: "first_night_deposit";
  noShowPenalty: "first_night_deposit";
};

export type PublicRoomTypeAvailability = {
  amenities: string[];
  availableCount: number;
  baseNightlyRate: number;
  cancellationPolicy: CancellationPolicyData;
  capacity: number;
  depositRule: DepositRule;
  id: string;
  name: string;
  photoUrls: string[];
  priceSummary: AvailabilityPriceSummary;
};

export type PublicAvailabilityResponse = {
  checkIn: string;
  checkOut: string;
  currency: string;
  guests: number;
  nights: number;
  roomTypes: PublicRoomTypeAvailability[];
};

export type AssignableRoomTypeSummary = {
  capacity: number;
  id: string;
  name: string;
};

export type AssignableRoom = {
  floor?: string;
  id: string;
  roomNumber: string;
  roomType: AssignableRoomTypeSummary;
  status: RoomStatus;
};

export type AssignableRoomsResponse = {
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  reservationId?: string;
  roomTypeId: string;
  rooms: AssignableRoom[];
};

export type AvailabilityCurrency = 'ARS' | (string & {});

export type AvailabilityRoomTypeSummary = {
  amenities?: string[];
  baseNightlyRate?: number;
  capacity: number;
  id: string;
  name: string;
  photoUrls?: string[];
};

export type AvailabilityPriceSummary = {
  currency: AvailabilityCurrency;
  nightlyRate: number;
  nights: number;
  subtotal: number;
  taxesAndFeesIncluded: boolean;
  total: number;
};

export type AvailabilityDepositRule = {
  amount: number;
  code: string;
  currency: AvailabilityCurrency;
  description: string;
  type: 'first_night';
};

export type AvailabilityCancellationPolicy = {
  code: string;
  description: string;
  freeCancellationUntilHoursBeforeCheckIn: number;
  lateCancellationPenalty: 'first_night_deposit';
  noShowPenalty: 'first_night_deposit';
};

type PublicRoomTypeAvailability = {
  amenities: string[];
  availableCount: number;
  baseNightlyRate: number;
  cancellationPolicy: AvailabilityCancellationPolicy;
  capacity: number;
  depositRule: AvailabilityDepositRule;
  id: string;
  name: string;
  photoUrls: string[];
  priceSummary: AvailabilityPriceSummary;
};

export type { PublicRoomTypeAvailability as default };

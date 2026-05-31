import type {
  AvailabilityCancellationPolicy,
  AvailabilityDepositRule,
  AvailabilityPriceSummary,
} from '../../availability';
import { isAvailabilityDateRangeValid } from '../../availability';
import type {
  PendingPublicReservation,
  PublicReservationRequest,
} from '../types';
import type { ReservationRepository } from './ReservationRepository';

const mockNightlyRates: Record<string, number> = {
  'mock-family': 150000,
  'mock-standard': 90000,
};

const mockRoomTypeNames: Record<string, string> = {
  'mock-family': 'Family',
  'mock-standard': 'Standard',
};

function calculateNights(checkIn: string, checkOut: string): number {
  if (!isAvailabilityDateRangeValid(checkIn, checkOut)) {
    return 0;
  }

  const checkInTime = Date.parse(`${checkIn}T00:00:00.000Z`);
  const checkOutTime = Date.parse(`${checkOut}T00:00:00.000Z`);
  const millisecondsPerNight = 24 * 60 * 60 * 1000;

  return Math.round((checkOutTime - checkInTime) / millisecondsPerNight);
}

function createPriceSummary(
  input: PublicReservationRequest,
): AvailabilityPriceSummary {
  const nightlyRate = mockNightlyRates[input.roomTypeId] ?? 90000;
  const nights = calculateNights(input.checkInDate, input.checkOutDate);
  const total = nightlyRate * nights;

  return {
    currency: 'ARS',
    nightlyRate,
    nights,
    subtotal: total,
    taxesAndFeesIncluded: true,
    total,
  };
}

function createDepositRule(amount: number): AvailabilityDepositRule {
  return {
    amount,
    code: 'FIRST_NIGHT_DEPOSIT',
    currency: 'ARS',
    description: 'A first-night deposit is required for booking.',
    type: 'first_night',
  };
}

function createCancellationPolicy(): AvailabilityCancellationPolicy {
  return {
    code: 'FREE_CANCELLATION_UNTIL_48H_BEFORE_CHECK_IN',
    description:
      'Free cancellation is available until 48 hours before check-in. Late cancellations and no-shows may retain the first-night deposit.',
    freeCancellationUntilHoursBeforeCheckIn: 48,
    lateCancellationPenalty: 'first_night_deposit',
    noShowPenalty: 'first_night_deposit',
  };
}

function createReference(): string {
  return `PUB-${Date.now().toString(36).toUpperCase()}`;
}

export function createMockReservationRepository(): ReservationRepository {
  return {
    async createPublicReservation(
      input: PublicReservationRequest,
    ): Promise<PendingPublicReservation> {
      const priceSummary = createPriceSummary(input);
      const createdAt = new Date().toISOString();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      return {
        cancellationPolicy: createCancellationPolicy(),
        checkInDate: input.checkInDate,
        checkOutDate: input.checkOutDate,
        createdAt,
        currency: priceSummary.currency,
        depositRule: createDepositRule(priceSummary.nightlyRate),
        expiresAt,
        guest: input.guest,
        guestCount: input.guestCount,
        id: `mock-reservation-${Date.now()}`,
        priceSummary,
        reference: createReference(),
        roomType: {
          baseNightlyRate: priceSummary.nightlyRate,
          capacity: input.roomTypeId === 'mock-family' ? 4 : 2,
          id: input.roomTypeId,
          name: mockRoomTypeNames[input.roomTypeId] ?? 'Standard',
        },
        status: 'pending_confirmation',
        totalAmount: priceSummary.total,
      };
    },
  };
}

export default createMockReservationRepository;

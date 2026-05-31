import { isAvailabilityDateRangeValid } from '../business';
import type {
  AssignableRoom,
  AssignableRoomSearchCriteria,
  AvailabilityPriceSummary,
  AvailabilityRoomTypeSummary,
  AvailabilitySearchCriteria,
  PublicRoomTypeAvailability,
} from '../types';
import type { AvailabilityRepository } from './AvailabilityRepository';

type MockRoomType = AvailabilityRoomTypeSummary & {
  baseNightlyRate: number;
};

const mockRoomTypes: MockRoomType[] = [
  {
    id: 'mock-standard',
    name: 'Standard',
    capacity: 2,
    amenities: ['Wi-Fi', 'Breakfast'],
    baseNightlyRate: 90000,
    photoUrls: ['https://example.com/standard.jpg'],
  },
  {
    id: 'mock-family',
    name: 'Family',
    capacity: 4,
    amenities: ['Wi-Fi', 'Kitchenette', 'Crib available'],
    baseNightlyRate: 150000,
    photoUrls: ['https://example.com/family.jpg'],
  },
];

const mockRooms: AssignableRoom[] = [
  {
    id: 'mock-room-101',
    roomNumber: '101',
    floor: '1',
    roomType: {
      id: 'mock-standard',
      name: 'Standard',
      capacity: 2,
      isActive: true,
    },
    status: 'available',
  },
  {
    id: 'mock-room-102',
    roomNumber: '102',
    floor: '1',
    roomType: {
      id: 'mock-standard',
      name: 'Standard',
      capacity: 2,
      isActive: true,
    },
    status: 'cleaning',
  },
  {
    id: 'mock-room-103',
    roomNumber: '103',
    floor: '1',
    roomType: {
      id: 'mock-standard',
      name: 'Standard',
      capacity: 2,
      isActive: true,
    },
    status: 'available',
  },
  {
    id: 'mock-room-201',
    roomNumber: '201',
    floor: '2',
    roomType: {
      id: 'mock-family',
      name: 'Family',
      capacity: 4,
      isActive: true,
    },
    status: 'available',
  },
];

function calculateNights(criteria: AvailabilitySearchCriteria): number {
  if (!isAvailabilityDateRangeValid(criteria.checkIn, criteria.checkOut)) {
    return 0;
  }

  const checkInTime = Date.parse(`${criteria.checkIn}T00:00:00.000Z`);
  const checkOutTime = Date.parse(`${criteria.checkOut}T00:00:00.000Z`);
  const millisecondsPerNight = 24 * 60 * 60 * 1000;

  return Math.round((checkOutTime - checkInTime) / millisecondsPerNight);
}

function createPriceSummary(
  roomType: MockRoomType,
  criteria: AvailabilitySearchCriteria,
): AvailabilityPriceSummary {
  const nights = calculateNights(criteria);
  const subtotal = roomType.baseNightlyRate * nights;

  return {
    currency: 'ARS',
    nightlyRate: roomType.baseNightlyRate,
    nights,
    subtotal,
    taxesAndFeesIncluded: true,
    total: subtotal,
  };
}

function sortAssignableRooms(rooms: AssignableRoom[]): AssignableRoom[] {
  return [...rooms].sort((first, second) => {
    const floorCompare = (first.floor ?? '').localeCompare(second.floor ?? '');

    return floorCompare === 0
      ? first.roomNumber.localeCompare(second.roomNumber)
      : floorCompare;
  });
}

function getAvailableRoomCount(
  roomTypeId: string,
  criteria: AvailabilitySearchCriteria,
): number {
  return mockRooms.filter(
    (room) =>
      room.roomType.id === roomTypeId &&
      room.roomType.capacity >= criteria.guests &&
      room.status === 'available',
  ).length;
}

function createPublicAvailabilityResult(
  roomType: MockRoomType,
  criteria: AvailabilitySearchCriteria,
): PublicRoomTypeAvailability {
  return {
    amenities: roomType.amenities ?? [],
    availableCount: getAvailableRoomCount(roomType.id, criteria),
    baseNightlyRate: roomType.baseNightlyRate,
    cancellationPolicy: {
      code: 'FREE_CANCELLATION_UNTIL_48H_BEFORE_CHECK_IN',
      description:
        'Free cancellation is available until 48 hours before check-in. Late cancellations and no-shows may retain the first-night deposit.',
      freeCancellationUntilHoursBeforeCheckIn: 48,
      lateCancellationPenalty: 'first_night_deposit',
      noShowPenalty: 'first_night_deposit',
    },
    capacity: roomType.capacity,
    depositRule: {
      amount: roomType.baseNightlyRate,
      code: 'FIRST_NIGHT_DEPOSIT',
      currency: 'ARS',
      description: 'A first-night deposit is required for booking.',
      type: 'first_night',
    },
    id: roomType.id,
    name: roomType.name,
    photoUrls: roomType.photoUrls ?? [],
    priceSummary: createPriceSummary(roomType, criteria),
  };
}

export function createMockAvailabilityRepository(): AvailabilityRepository {
  return {
    async listAssignableRooms(
      _token: string,
      criteria: AssignableRoomSearchCriteria,
    ): Promise<AssignableRoom[]> {
      if (
        !criteria.roomTypeId ||
        !isAvailabilityDateRangeValid(criteria.checkIn, criteria.checkOut)
      ) {
        return [];
      }

      return sortAssignableRooms(
        mockRooms.filter(
          (room) =>
            room.roomType.id === criteria.roomTypeId &&
            room.roomType.capacity >= criteria.guests &&
            room.status === 'available',
        ),
      );
    },

    async searchPublicAvailability(
      criteria: AvailabilitySearchCriteria,
    ): Promise<PublicRoomTypeAvailability[]> {
      if (!isAvailabilityDateRangeValid(criteria.checkIn, criteria.checkOut)) {
        return [];
      }

      return mockRoomTypes
        .filter((roomType) => roomType.capacity >= criteria.guests)
        .map((roomType) => createPublicAvailabilityResult(roomType, criteria));
    },
  };
}

export default createMockAvailabilityRepository;

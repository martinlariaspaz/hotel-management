import type { RoomType } from '../types';
import type {
  CreateRoomTypeInput,
  RoomTypeRepository,
  UpdateRoomTypeInput,
} from './RoomTypeRepository';

const initialRoomTypes: RoomType[] = [
  {
    id: 'mock-standard',
    name: 'Standard',
    capacity: 2,
    amenities: ['Wi-Fi', 'Breakfast'],
    photoUrls: ['https://example.com/standard.jpg'],
    baseNightlyRate: 90000,
    isActive: true,
  },
  {
    id: 'mock-family',
    name: 'Family',
    capacity: 4,
    amenities: ['Wi-Fi', 'Kitchenette', 'Crib available'],
    photoUrls: ['https://example.com/family.jpg'],
    baseNightlyRate: 150000,
    isActive: true,
  },
];

export function createMockRoomTypeRepository(): RoomTypeRepository {
  let nextId = 1;
  let roomTypes = [...initialRoomTypes];

  return {
    async createRoomType(
      _token: string,
      input: CreateRoomTypeInput,
    ): Promise<RoomType> {
      if (roomTypes.some((roomType) => roomType.name === input.name)) {
        throw new Error('Room type name already exists');
      }

      const roomType: RoomType = {
        id: `mock-room-type-${nextId}`,
        ...input,
        isActive: true,
      };

      nextId += 1;
      roomTypes = [...roomTypes, roomType];

      return roomType;
    },

    async deactivateRoomType(
      _token: string,
      roomTypeId: string,
    ): Promise<RoomType> {
      const existingRoomType = roomTypes.find(
        (roomType) => roomType.id === roomTypeId,
      );

      if (!existingRoomType) {
        throw new Error('Room type not found');
      }

      const updatedRoomType: RoomType = {
        ...existingRoomType,
        isActive: false,
      };

      roomTypes = roomTypes.map((roomType) =>
        roomType.id === roomTypeId ? updatedRoomType : roomType,
      );

      return updatedRoomType;
    },

    async getRoomType(_token: string, roomTypeId: string): Promise<RoomType> {
      const roomType = roomTypes.find(
        (currentRoomType) => currentRoomType.id === roomTypeId,
      );

      if (!roomType) {
        throw new Error('Room type not found');
      }

      return roomType;
    },

    async listActiveRoomTypes(): Promise<RoomType[]> {
      return roomTypes
        .filter((roomType) => roomType.isActive)
        .sort((first, second) => first.name.localeCompare(second.name));
    },

    async listRoomTypes(): Promise<RoomType[]> {
      return [...roomTypes].sort((first, second) =>
        first.name.localeCompare(second.name),
      );
    },

    async updateRoomType(
      _token: string,
      roomTypeId: string,
      input: UpdateRoomTypeInput,
    ): Promise<RoomType> {
      const existingRoomType = roomTypes.find(
        (roomType) => roomType.id === roomTypeId,
      );

      if (!existingRoomType) {
        throw new Error('Room type not found');
      }

      const updatedRoomType: RoomType = {
        ...existingRoomType,
        ...input,
      };

      roomTypes = roomTypes.map((roomType) =>
        roomType.id === roomTypeId ? updatedRoomType : roomType,
      );

      return updatedRoomType;
    },
  };
}

export default createMockRoomTypeRepository;

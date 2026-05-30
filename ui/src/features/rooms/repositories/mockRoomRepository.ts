import type { RoomStatus } from '../../statuses';
import type { Room, RoomTypeSummary } from '../types';
import type {
  CreateRoomInput,
  RoomListFilters,
  RoomRepository,
  UpdateRoomInput,
} from './RoomRepository';

const initialRoomTypes: RoomTypeSummary[] = [
  {
    id: 'mock-standard',
    name: 'Standard',
    capacity: 2,
    isActive: true,
  },
  {
    id: 'mock-family',
    name: 'Family',
    capacity: 4,
    isActive: true,
  },
];

const initialRooms: Room[] = [
  {
    id: 'mock-room-101',
    roomNumber: '101',
    floor: '1',
    roomType: initialRoomTypes[0],
    status: 'available',
  },
  {
    id: 'mock-room-102',
    roomNumber: '102',
    floor: '1',
    roomType: initialRoomTypes[0],
    status: 'cleaning',
  },
  {
    id: 'mock-room-201',
    roomNumber: '201',
    floor: '2',
    notes: 'Quiet corner room',
    roomType: initialRoomTypes[1],
    status: 'reserved',
  },
];

function sortRooms(rooms: Room[]): Room[] {
  return [...rooms].sort((first, second) => {
    const floorCompare = (first.floor ?? '').localeCompare(second.floor ?? '');

    return floorCompare === 0
      ? first.roomNumber.localeCompare(second.roomNumber)
      : floorCompare;
  });
}

function normalizeOptionalText(value: string | undefined): string | undefined {
  const normalizedValue = value?.trim();

  return normalizedValue ? normalizedValue : undefined;
}

export function createMockRoomRepository(): RoomRepository {
  let nextId = 1;
  let rooms = [...initialRooms];

  function findRoom(roomId: string): Room {
    const room = rooms.find((currentRoom) => currentRoom.id === roomId);

    if (!room) {
      throw new Error('Room not found');
    }

    return room;
  }

  function findRoomType(roomTypeId: string): RoomTypeSummary {
    const roomType = initialRoomTypes.find(
      (currentRoomType) => currentRoomType.id === roomTypeId,
    );

    if (!roomType) {
      throw new Error('Room type not found');
    }

    return roomType;
  }

  return {
    async createRoom(_token: string, input: CreateRoomInput): Promise<Room> {
      if (rooms.some((room) => room.roomNumber === input.roomNumber)) {
        throw new Error('Room number already exists');
      }

      const room: Room = {
        id: `mock-room-${nextId}`,
        roomNumber: input.roomNumber,
        floor: normalizeOptionalText(input.floor),
        notes: normalizeOptionalText(input.notes),
        roomType: findRoomType(input.roomTypeId),
        status: 'available',
      };

      nextId += 1;
      rooms = [...rooms, room];

      return room;
    },

    async getRoom(_token: string, roomId: string): Promise<Room> {
      return findRoom(roomId);
    },

    async listRooms(
      _token: string,
      filters: RoomListFilters = {},
    ): Promise<Room[]> {
      return sortRooms(
        rooms.filter((room) => {
          const matchesStatus =
            !filters.status || room.status === filters.status;
          const matchesRoomType =
            !filters.roomTypeId || room.roomType.id === filters.roomTypeId;
          const matchesFloor = !filters.floor || room.floor === filters.floor;

          return matchesStatus && matchesRoomType && matchesFloor;
        }),
      );
    },

    async updateRoom(
      _token: string,
      roomId: string,
      input: UpdateRoomInput,
    ): Promise<Room> {
      const existingRoom = findRoom(roomId);
      const updatedRoom: Room = {
        ...existingRoom,
        roomNumber: input.roomNumber ?? existingRoom.roomNumber,
        floor:
          input.floor !== undefined
            ? normalizeOptionalText(input.floor)
            : existingRoom.floor,
        notes:
          input.notes !== undefined
            ? normalizeOptionalText(input.notes)
            : existingRoom.notes,
        roomType: input.roomTypeId
          ? findRoomType(input.roomTypeId)
          : existingRoom.roomType,
      };

      rooms = rooms.map((room) => (room.id === roomId ? updatedRoom : room));

      return updatedRoom;
    },

    async updateRoomStatus(
      _token: string,
      roomId: string,
      status: RoomStatus,
    ): Promise<Room> {
      const existingRoom = findRoom(roomId);
      const updatedRoom: Room = {
        ...existingRoom,
        status,
      };

      rooms = rooms.map((room) => (room.id === roomId ? updatedRoom : room));

      return updatedRoom;
    },
  };
}

export default createMockRoomRepository;


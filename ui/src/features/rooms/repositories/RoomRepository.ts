import type { RoomStatus } from '../../statuses';
import type { Room } from '../types';

export type RoomListFilters = {
  floor?: string;
  roomTypeId?: string;
  status?: RoomStatus;
};

export type CreateRoomInput = {
  floor?: string;
  notes?: string;
  roomNumber: string;
  roomTypeId: string;
};

export type UpdateRoomInput = Partial<CreateRoomInput>;

export type RoomRepository = {
  createRoom(token: string, input: CreateRoomInput): Promise<Room>;
  getRoom(token: string, roomId: string): Promise<Room>;
  listRooms(token: string, filters?: RoomListFilters): Promise<Room[]>;
  updateRoom(
    token: string,
    roomId: string,
    input: UpdateRoomInput,
  ): Promise<Room>;
  updateRoomStatus(
    token: string,
    roomId: string,
    status: RoomStatus,
  ): Promise<Room>;
};

export type { RoomRepository as default };


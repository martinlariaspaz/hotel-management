import type { RoomType } from '../types';

export type CreateRoomTypeInput = {
  amenities: string[];
  baseNightlyRate: number;
  capacity: number;
  name: string;
  photoUrls: string[];
};

export type UpdateRoomTypeInput = Partial<CreateRoomTypeInput>;

export type RoomTypeRepository = {
  createRoomType(
    token: string,
    input: CreateRoomTypeInput,
  ): Promise<RoomType>;
  deactivateRoomType(token: string, roomTypeId: string): Promise<RoomType>;
  getRoomType(token: string, roomTypeId: string): Promise<RoomType>;
  listActiveRoomTypes(): Promise<RoomType[]>;
  listRoomTypes(token: string): Promise<RoomType[]>;
  updateRoomType(
    token: string,
    roomTypeId: string,
    input: UpdateRoomTypeInput,
  ): Promise<RoomType>;
};

export type { RoomTypeRepository as default };

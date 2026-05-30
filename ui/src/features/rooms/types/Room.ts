import type { RoomStatus } from '../../statuses';

export type RoomTypeSummary = {
  capacity: number;
  id: string;
  isActive: boolean;
  name: string;
};

export type Room = {
  floor?: string;
  id: string;
  notes?: string;
  roomNumber: string;
  roomType: RoomTypeSummary;
  status: RoomStatus;
};

export type { Room as default };


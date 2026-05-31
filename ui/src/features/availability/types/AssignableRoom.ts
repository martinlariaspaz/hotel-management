import type { RoomStatus } from '../../statuses';

export type AssignableRoomTypeSummary = {
  capacity: number;
  id: string;
  isActive?: boolean;
  name: string;
};

type AssignableRoom = {
  floor?: string;
  id: string;
  notes?: string;
  roomNumber: string;
  roomType: AssignableRoomTypeSummary;
  status: RoomStatus;
};

export type { AssignableRoom as default };

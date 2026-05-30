import type { RoomStatus } from "../../common/enums";

export type RoomTypeSummary = {
  capacity: number;
  id: string;
  isActive: boolean;
  name: string;
};

export type StaffRoom = {
  floor?: string;
  id: string;
  notes?: string;
  roomNumber: string;
  roomType: RoomTypeSummary;
  status: RoomStatus;
};


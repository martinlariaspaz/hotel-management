import type {
  MaintenanceBlockStatus,
  RoomStatus,
  UserRole,
} from "../../common/enums";

export type MaintenanceBlockRoomSummary = {
  id: string;
  roomNumber: string;
  status: RoomStatus;
};

export type MaintenanceBlockStaffUser = {
  id: string;
  role: UserRole;
  username: string;
};

export type StaffMaintenanceBlock = {
  cancelledAt?: string;
  cancelledBy?: MaintenanceBlockStaffUser;
  createdAt: string;
  createdBy: MaintenanceBlockStaffUser;
  endDate: string;
  id: string;
  reason: string;
  room: MaintenanceBlockRoomSummary;
  startDate: string;
  status: MaintenanceBlockStatus;
  updatedAt: string;
};

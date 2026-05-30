import type { UserRole } from '../../auth';
import type { RoomStatus } from '../../statuses';
import type { MaintenanceBlockStatus } from './MaintenanceBlockStatus';

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

export type MaintenanceBlock = {
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

export type { MaintenanceBlock as default };

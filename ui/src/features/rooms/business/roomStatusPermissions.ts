import type { UserRole } from '../../auth';
import type { RoomStatus } from '../../statuses';

export const ROOM_STATUS_VALUES = [
  'available',
  'reserved',
  'occupied',
  'cleaning',
  'dirty',
  'maintenance',
  'out_of_service',
] as const satisfies readonly RoomStatus[];

export const HOUSEKEEPING_ROOM_STATUS_VALUES = [
  'available',
  'cleaning',
  'dirty',
] as const satisfies readonly RoomStatus[];

export function canManageRoomInventory(role: UserRole): boolean {
  return role === 'admin' || role === 'reception';
}

export function canUpdateRoomStatus(role: UserRole): boolean {
  return (
    role === 'admin' ||
    role === 'reception' ||
    role === 'housekeeping'
  );
}

export function getAllowedRoomStatusUpdates(
  role: UserRole,
): readonly RoomStatus[] {
  if (role === 'housekeeping') {
    return HOUSEKEEPING_ROOM_STATUS_VALUES;
  }

  if (role === 'admin' || role === 'reception') {
    return ROOM_STATUS_VALUES;
  }

  return [];
}

export function isRoomStatus(value: string | null): value is RoomStatus {
  return ROOM_STATUS_VALUES.some((status) => status === value);
}

const roomStatusPermissions = {
  HOUSEKEEPING_ROOM_STATUS_VALUES,
  ROOM_STATUS_VALUES,
  canManageRoomInventory,
  canUpdateRoomStatus,
  getAllowedRoomStatusUpdates,
  isRoomStatus,
} as const;

export default roomStatusPermissions;


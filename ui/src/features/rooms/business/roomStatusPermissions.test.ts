import {
  HOUSEKEEPING_ROOM_STATUS_VALUES,
  ROOM_STATUS_VALUES,
  canManageRoomInventory,
  canUpdateRoomStatus,
  getAllowedRoomStatusUpdates,
  isRoomStatus,
} from './roomStatusPermissions';

describe('roomStatusPermissions', () => {
  it('keeps the room status values aligned with the shared UI contract', () => {
    expect(ROOM_STATUS_VALUES).toEqual([
      'available',
      'reserved',
      'occupied',
      'cleaning',
      'dirty',
      'maintenance',
      'out_of_service',
    ]);
    expect(isRoomStatus('out_of_service')).toBe(true);
    expect(isRoomStatus('blocked')).toBe(false);
  });

  it('limits housekeeping to cleaning-related status updates', () => {
    expect(HOUSEKEEPING_ROOM_STATUS_VALUES).toEqual([
      'available',
      'cleaning',
      'dirty',
    ]);
    expect(getAllowedRoomStatusUpdates('housekeeping')).toEqual([
      'available',
      'cleaning',
      'dirty',
    ]);
  });

  it('allows only admin and reception to manage room inventory', () => {
    expect(canManageRoomInventory('admin')).toBe(true);
    expect(canManageRoomInventory('reception')).toBe(true);
    expect(canManageRoomInventory('housekeeping')).toBe(false);
    expect(canManageRoomInventory('management')).toBe(false);
  });

  it('allows operational status updates without exposing setup to management', () => {
    expect(canUpdateRoomStatus('admin')).toBe(true);
    expect(canUpdateRoomStatus('reception')).toBe(true);
    expect(canUpdateRoomStatus('housekeeping')).toBe(true);
    expect(canUpdateRoomStatus('management')).toBe(false);
  });
});


const realtimeEvents = {
  maintenanceBlocksChanged: 'maintenance-blocks:changed',
  roomsChanged: 'rooms:changed',
  roomTypesChanged: 'room-types:changed',
  staffUsersChanged: 'staff-users:changed',
} as const;

export default realtimeEvents;

export type RoomStatus =
  | 'available'
  | 'reserved'
  | 'occupied'
  | 'cleaning'
  | 'dirty'
  | 'maintenance'
  | 'out_of_service';

export type { RoomStatus as default };

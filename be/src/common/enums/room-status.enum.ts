export enum RoomStatus {
  Available = "available",
  Reserved = "reserved",
  Occupied = "occupied",
  Cleaning = "cleaning",
  Dirty = "dirty",
  Maintenance = "maintenance",
  OutOfService = "out_of_service",
}

export const ROOM_STATUS_VALUES = Object.values(RoomStatus);

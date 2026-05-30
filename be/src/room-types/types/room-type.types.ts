export type PublicRoomType = {
  amenities: string[];
  baseNightlyRate: number;
  capacity: number;
  id: string;
  name: string;
  photoUrls: string[];
};

export type AdminRoomType = PublicRoomType & {
  isActive: boolean;
};

export type RoomTypeResponse = PublicRoomType | AdminRoomType;

export type { PublicRoomType as default };


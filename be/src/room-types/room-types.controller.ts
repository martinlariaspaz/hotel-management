import { Controller, Get, Param } from "@nestjs/common";
import { RoomTypesService } from "./services";
import type { PublicRoomType } from "./types";

@Controller("room-types")
export class RoomTypesController {
  constructor(private readonly roomTypesService: RoomTypesService) {}

  @Get()
  listRoomTypes(): Promise<PublicRoomType[]> {
    return this.roomTypesService.listPublicRoomTypes();
  }

  @Get(":roomTypeId")
  getRoomType(
    @Param("roomTypeId") roomTypeId: string,
  ): Promise<PublicRoomType> {
    return this.roomTypesService.getPublicRoomType(roomTypeId);
  }
}

export default RoomTypesController;


import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { Roles } from "../auth/decorators";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { UserRole } from "../auth/types/user-role.type";
import { CreateRoomTypeDto, UpdateRoomTypeDto } from "./dto";
import { RoomTypesService } from "./services";
import type { AdminRoomType } from "./types";

@Controller("admin/room-types")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.Admin)
export class AdminRoomTypesController {
  constructor(private readonly roomTypesService: RoomTypesService) {}

  @Get()
  listRoomTypes(): Promise<AdminRoomType[]> {
    return this.roomTypesService.listAdminRoomTypes();
  }

  @Get(":roomTypeId")
  getRoomType(
    @Param("roomTypeId") roomTypeId: string,
  ): Promise<AdminRoomType> {
    return this.roomTypesService.getAdminRoomType(roomTypeId);
  }

  @Post()
  createRoomType(
    @Body() dto: CreateRoomTypeDto,
  ): Promise<AdminRoomType> {
    return this.roomTypesService.createRoomType(dto);
  }

  @Patch(":roomTypeId")
  updateRoomType(
    @Param("roomTypeId") roomTypeId: string,
    @Body() dto: UpdateRoomTypeDto,
  ): Promise<AdminRoomType> {
    return this.roomTypesService.updateRoomType(roomTypeId, dto);
  }

  @Patch(":roomTypeId/deactivate")
  deactivateRoomType(
    @Param("roomTypeId") roomTypeId: string,
  ): Promise<AdminRoomType> {
    return this.roomTypesService.deactivateRoomType(roomTypeId);
  }
}

export default AdminRoomTypesController;


import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Roles } from "../auth/decorators";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import type { AuthenticatedRequest } from "../auth/types/auth.types";
import { UserRole } from "../auth/types/user-role.type";
import {
  CreateRoomDto,
  ListRoomsQueryDto,
  UpdateRoomDto,
  UpdateRoomStatusDto,
} from "./dto";
import { RoomsService } from "./services";
import type { StaffRoom } from "./types";

const readableRoomRoles = [
  UserRole.Admin,
  UserRole.Reception,
  UserRole.Housekeeping,
  UserRole.Management,
] as const;

@Controller("staff/rooms")
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  @Roles(...readableRoomRoles)
  listRooms(@Query() query: ListRoomsQueryDto): Promise<StaffRoom[]> {
    return this.roomsService.listRooms(query);
  }

  @Get(":roomId")
  @Roles(...readableRoomRoles)
  getRoom(@Param("roomId") roomId: string): Promise<StaffRoom> {
    return this.roomsService.getRoom(roomId);
  }

  @Post()
  @Roles(UserRole.Admin, UserRole.Reception)
  createRoom(@Body() dto: CreateRoomDto): Promise<StaffRoom> {
    return this.roomsService.createRoom(dto);
  }

  @Patch(":roomId")
  @Roles(UserRole.Admin, UserRole.Reception)
  updateRoom(
    @Param("roomId") roomId: string,
    @Body() dto: UpdateRoomDto,
  ): Promise<StaffRoom> {
    return this.roomsService.updateRoom(roomId, dto);
  }

  @Patch(":roomId/status")
  @Roles(UserRole.Admin, UserRole.Reception, UserRole.Housekeeping)
  updateRoomStatus(
    @Param("roomId") roomId: string,
    @Body() dto: UpdateRoomStatusDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<StaffRoom> {
    return this.roomsService.updateRoomStatus(
      roomId,
      dto.status,
      request.auth!.user.role,
    );
  }
}

export default RoomsController;


import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { Roles } from "../auth/decorators";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { UserRole } from "../auth/types/user-role.type";
import { AssignableRoomsQueryDto, PublicAvailabilityQueryDto } from "./dto";
import { AvailabilityService } from "./services";
import type {
  AssignableRoomsResponse,
  PublicAvailabilityResponse,
} from "./types";

const assignableRoomRoles = [
  UserRole.Admin,
  UserRole.Reception,
  UserRole.Management,
] as const;

@Controller("availability")
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get("public")
  getPublicAvailability(
    @Query() query: PublicAvailabilityQueryDto,
  ): Promise<PublicAvailabilityResponse> {
    return this.availabilityService.getPublicAvailability(query);
  }

  @Get("assignable-rooms")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...assignableRoomRoles)
  getAssignableRooms(
    @Query() query: AssignableRoomsQueryDto,
  ): Promise<AssignableRoomsResponse> {
    return this.availabilityService.getAssignableRooms(query);
  }
}

export default AvailabilityController;

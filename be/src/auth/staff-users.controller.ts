import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { Roles } from "./decorators";
import { CreateStaffUserDto } from "./dto/create-staff-user.dto";
import { UpdateStaffUserDto } from "./dto/update-staff-user.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { RolesGuard } from "./guards/roles.guard";
import { StaffUsersService } from "./services/staff-users.service";
import type { StaffUser } from "./types/staff-user.types";
import { UserRole } from "./types/user-role.type";

@Controller("staff/users")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.Admin)
export class StaffUsersController {
  constructor(private readonly staffUsersService: StaffUsersService) {}

  @Get()
  listStaffUsers(): Promise<StaffUser[]> {
    return this.staffUsersService.listStaffUsers();
  }

  @Post()
  createStaffUser(@Body() dto: CreateStaffUserDto): Promise<StaffUser> {
    return this.staffUsersService.createStaffUser(dto);
  }

  @Patch(":userId")
  updateStaffUser(
    @Param("userId") userId: string,
    @Body() dto: UpdateStaffUserDto,
  ): Promise<StaffUser> {
    return this.staffUsersService.updateStaffUser(userId, dto);
  }
}

export default StaffUsersController;

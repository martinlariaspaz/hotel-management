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
  CreateMaintenanceBlockDto,
  ListMaintenanceBlocksQueryDto,
} from "./dto";
import { MaintenanceBlocksService } from "./services";
import type { StaffMaintenanceBlock } from "./types";

const readableMaintenanceBlockRoles = [
  UserRole.Admin,
  UserRole.Reception,
  UserRole.Housekeeping,
  UserRole.Management,
] as const;

@Controller("staff/maintenance-blocks")
@UseGuards(JwtAuthGuard, RolesGuard)
export class MaintenanceBlocksController {
  constructor(
    private readonly maintenanceBlocksService: MaintenanceBlocksService,
  ) {}

  @Get()
  @Roles(...readableMaintenanceBlockRoles)
  listMaintenanceBlocks(
    @Query() query: ListMaintenanceBlocksQueryDto,
  ): Promise<StaffMaintenanceBlock[]> {
    return this.maintenanceBlocksService.listMaintenanceBlocks(query);
  }

  @Post()
  @Roles(UserRole.Admin, UserRole.Reception)
  createMaintenanceBlock(
    @Body() dto: CreateMaintenanceBlockDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<StaffMaintenanceBlock> {
    return this.maintenanceBlocksService.createMaintenanceBlock(
      dto,
      request.auth!.user,
    );
  }

  @Patch(":maintenanceBlockId/cancel")
  @Roles(UserRole.Admin, UserRole.Reception)
  cancelMaintenanceBlock(
    @Param("maintenanceBlockId") maintenanceBlockId: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<StaffMaintenanceBlock> {
    return this.maintenanceBlocksService.cancelMaintenanceBlock(
      maintenanceBlockId,
      request.auth!.user,
    );
  }
}

export default MaintenanceBlocksController;

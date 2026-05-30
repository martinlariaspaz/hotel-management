import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, QueryFilter, Types, isValidObjectId } from "mongoose";
import type { AuthenticatedUser } from "../../auth/types/auth.types";
import { UserDocument } from "../../auth/schemas/user.schema";
import {
  MaintenanceBlockStatus,
  RoomStatus,
} from "../../common/enums";
import { HotelBusinessConflictException } from "../../common/errors";
import {
  REALTIME_EVENT_NAMES,
  RealtimeGateway,
} from "../../realtime/realtime.gateway";
import { Room, RoomDocument } from "../../rooms/schemas";
import {
  CreateMaintenanceBlockDto,
  ListMaintenanceBlocksQueryDto,
} from "../dto";
import {
  MaintenanceBlock,
  MaintenanceBlockDocument,
} from "../schemas";
import type {
  MaintenanceBlockRoomSummary,
  MaintenanceBlockStaffUser,
  StaffMaintenanceBlock,
} from "../types";

type PopulatedMaintenanceBlockDocument = Omit<
  MaintenanceBlock,
  "cancelledBy" | "createdBy" | "room"
> & {
  _id: Types.ObjectId;
  cancelledAt?: Date;
  cancelledBy?: Pick<UserDocument, "_id" | "role" | "username">;
  createdAt: Date;
  createdBy: Pick<UserDocument, "_id" | "role" | "username">;
  room: Pick<RoomDocument, "_id" | "roomNumber" | "status">;
  updatedAt: Date;
};

const ROOM_NOT_AVAILABLE_FOR_MAINTENANCE_STATUSES = new Set<RoomStatus>([
  RoomStatus.Occupied,
  RoomStatus.OutOfService,
  RoomStatus.Reserved,
]);

@Injectable()
export class MaintenanceBlocksService {
  constructor(
    @InjectModel(MaintenanceBlock.name)
    private readonly maintenanceBlockModel: Model<MaintenanceBlockDocument>,
    @InjectModel(Room.name)
    private readonly roomModel: Model<RoomDocument>,
    @Optional()
    private readonly realtimeGateway?: RealtimeGateway,
  ) {}

  async createMaintenanceBlock(
    dto: CreateMaintenanceBlockDto,
    actor: AuthenticatedUser,
  ): Promise<StaffMaintenanceBlock> {
    this.assertValidObjectId(actor.id, "Invalid staff user id");

    const startDate = this.parseDateOnly(dto.startDate);
    const endDate = this.parseDateOnly(dto.endDate);

    this.assertValidDateRange(startDate, endDate);

    const room = await this.findRoom(dto.roomId);

    this.assertRoomCanBeBlocked(room, dto.roomId);
    await this.assertNoActiveOverlap(dto.roomId, startDate, endDate);

    const maintenanceBlock = await this.maintenanceBlockModel.create({
      room: new Types.ObjectId(dto.roomId),
      startDate,
      endDate,
      reason: dto.reason,
      status: MaintenanceBlockStatus.Active,
      createdBy: new Types.ObjectId(actor.id),
    });

    const staffMaintenanceBlock: StaffMaintenanceBlock = {
      id: maintenanceBlock._id.toString(),
      room: this.toRoomSummary(room),
      startDate: this.toDateOnly(maintenanceBlock.startDate),
      endDate: this.toDateOnly(maintenanceBlock.endDate),
      reason: maintenanceBlock.reason,
      status: maintenanceBlock.status,
      createdBy: {
        id: actor.id,
        username: actor.username,
        role: actor.role,
      },
      createdAt: maintenanceBlock.createdAt.toISOString(),
      updatedAt: maintenanceBlock.updatedAt.toISOString(),
    };

    this.emitMaintenanceBlockChanged("created", staffMaintenanceBlock.id);

    return staffMaintenanceBlock;
  }

  async listMaintenanceBlocks(
    query: ListMaintenanceBlocksQueryDto = {},
  ): Promise<StaffMaintenanceBlock[]> {
    const filters: QueryFilter<MaintenanceBlock> = {};

    if (query.roomId !== undefined) {
      this.assertValidObjectId(query.roomId, "Invalid room id");
      filters.room = new Types.ObjectId(query.roomId);
    }

    if (query.status !== undefined) {
      filters.status = query.status;
    }

    if (query.startDate !== undefined || query.endDate !== undefined) {
      if (query.startDate === undefined || query.endDate === undefined) {
        throw new BadRequestException(
          "Both startDate and endDate are required for date range filtering",
        );
      }

      const startDate = this.parseDateOnly(query.startDate);
      const endDate = this.parseDateOnly(query.endDate);

      this.assertValidDateRange(startDate, endDate);

      filters.startDate = { $lt: endDate };
      filters.endDate = { $gt: startDate };
    }

    const maintenanceBlocks = await this.maintenanceBlockModel
      .find(filters)
      .populate<{ room: Pick<RoomDocument, "_id" | "roomNumber" | "status"> }>(
        "room",
      )
      .populate<{ createdBy: Pick<UserDocument, "_id" | "role" | "username"> }>(
        "createdBy",
      )
      .populate<{
        cancelledBy?: Pick<UserDocument, "_id" | "role" | "username">;
      }>("cancelledBy")
      .sort({ startDate: 1, endDate: 1, createdAt: 1 })
      .exec();

    return maintenanceBlocks.map((maintenanceBlock) =>
      this.toStaffMaintenanceBlock(
        maintenanceBlock as unknown as PopulatedMaintenanceBlockDocument,
      ),
    );
  }

  async cancelMaintenanceBlock(
    maintenanceBlockId: string,
    actor: AuthenticatedUser,
  ): Promise<StaffMaintenanceBlock> {
    this.assertValidObjectId(maintenanceBlockId, "Invalid maintenance block id");
    this.assertValidObjectId(actor.id, "Invalid staff user id");

    const existingMaintenanceBlock =
      await this.maintenanceBlockModel.findById(maintenanceBlockId).exec();

    if (!existingMaintenanceBlock) {
      throw new NotFoundException("Maintenance block not found");
    }

    if (existingMaintenanceBlock.status === MaintenanceBlockStatus.Cancelled) {
      throw new HotelBusinessConflictException(
        "Maintenance block is already cancelled",
        { maintenanceBlockId },
        "MAINTENANCE_BLOCK_ALREADY_CANCELLED",
      );
    }

    const maintenanceBlock = await this.maintenanceBlockModel
      .findByIdAndUpdate(
        maintenanceBlockId,
        {
          $set: {
            status: MaintenanceBlockStatus.Cancelled,
            cancelledAt: new Date(),
            cancelledBy: new Types.ObjectId(actor.id),
          },
        },
        { new: true, runValidators: true },
      )
      .populate<{ room: Pick<RoomDocument, "_id" | "roomNumber" | "status"> }>(
        "room",
      )
      .populate<{ createdBy: Pick<UserDocument, "_id" | "role" | "username"> }>(
        "createdBy",
      )
      .populate<{
        cancelledBy?: Pick<UserDocument, "_id" | "role" | "username">;
      }>("cancelledBy")
      .exec();

    if (!maintenanceBlock) {
      throw new NotFoundException("Maintenance block not found");
    }

    const staffMaintenanceBlock = this.toStaffMaintenanceBlock(
      maintenanceBlock as unknown as PopulatedMaintenanceBlockDocument,
    );

    this.emitMaintenanceBlockChanged("cancelled", staffMaintenanceBlock.id);

    return staffMaintenanceBlock;
  }

  private async findRoom(roomId: string): Promise<RoomDocument> {
    this.assertValidObjectId(roomId, "Invalid room id");

    const room = await this.roomModel.findById(roomId).exec();

    if (!room) {
      throw new NotFoundException("Room not found");
    }

    return room;
  }

  private assertRoomCanBeBlocked(room: RoomDocument, roomId: string): void {
    if (ROOM_NOT_AVAILABLE_FOR_MAINTENANCE_STATUSES.has(room.status)) {
      throw new HotelBusinessConflictException(
        "Room is not available for a maintenance block",
        {
          roomId,
          status: room.status,
        },
        "ROOM_NOT_AVAILABLE",
      );
    }
  }

  private async assertNoActiveOverlap(
    roomId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<void> {
    const overlappingBlock = await this.maintenanceBlockModel.exists({
      room: new Types.ObjectId(roomId),
      status: MaintenanceBlockStatus.Active,
      startDate: { $lt: endDate },
      endDate: { $gt: startDate },
    });

    if (overlappingBlock) {
      throw new HotelBusinessConflictException(
        "Room already has an active maintenance block in this date range",
        {
          roomId,
          startDate: this.toDateOnly(startDate),
          endDate: this.toDateOnly(endDate),
        },
        "MAINTENANCE_BLOCK_OVERLAP",
      );
    }
  }

  private assertValidDateRange(startDate: Date, endDate: Date): void {
    if (startDate >= endDate) {
      throw new BadRequestException("End date must be after start date");
    }
  }

  private assertValidObjectId(value: string, message: string): void {
    if (!isValidObjectId(value)) {
      throw new BadRequestException(message);
    }
  }

  private parseDateOnly(value: string): Date {
    const date = new Date(`${value}T00:00:00.000Z`);

    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException("Invalid date");
    }

    return date;
  }

  private toDateOnly(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private toRoomSummary(room: RoomDocument): MaintenanceBlockRoomSummary {
    return {
      id: room._id.toString(),
      roomNumber: room.roomNumber,
      status: room.status,
    };
  }

  private toStaffUserSummary(
    user: Pick<UserDocument, "_id" | "role" | "username">,
  ): MaintenanceBlockStaffUser {
    return {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
    };
  }

  private toStaffMaintenanceBlock(
    maintenanceBlock: PopulatedMaintenanceBlockDocument,
  ): StaffMaintenanceBlock {
    const staffMaintenanceBlock: StaffMaintenanceBlock = {
      id: maintenanceBlock._id.toString(),
      room: this.toRoomSummary(maintenanceBlock.room as RoomDocument),
      startDate: this.toDateOnly(maintenanceBlock.startDate),
      endDate: this.toDateOnly(maintenanceBlock.endDate),
      reason: maintenanceBlock.reason,
      status: maintenanceBlock.status,
      createdBy: this.toStaffUserSummary(maintenanceBlock.createdBy),
      createdAt: maintenanceBlock.createdAt.toISOString(),
      updatedAt: maintenanceBlock.updatedAt.toISOString(),
    };

    if (maintenanceBlock.cancelledAt) {
      staffMaintenanceBlock.cancelledAt =
        maintenanceBlock.cancelledAt.toISOString();
    }

    if (maintenanceBlock.cancelledBy) {
      staffMaintenanceBlock.cancelledBy = this.toStaffUserSummary(
        maintenanceBlock.cancelledBy,
      );
    }

    return staffMaintenanceBlock;
  }

  private emitMaintenanceBlockChanged(
    action: "cancelled" | "created",
    maintenanceBlockId: string,
  ): void {
    this.realtimeGateway?.emitMutationEvent(
      REALTIME_EVENT_NAMES.MaintenanceBlocksChanged,
      {
        action,
        entity: "maintenance-block",
        id: maintenanceBlockId,
      },
    );
  }
}

export default MaintenanceBlocksService;

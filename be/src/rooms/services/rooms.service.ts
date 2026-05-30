import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types, isValidObjectId } from "mongoose";
import { RoomStatus, UserRole } from "../../common/enums";
import {
  RoomType,
  RoomTypeDocument,
} from "../../room-types/schemas/room-type.schema";
import {
  CreateRoomDto,
  ListRoomsQueryDto,
  UpdateRoomDto,
} from "../dto";
import { Room, RoomDocument } from "../schemas";
import type { StaffRoom } from "../types";

type MongoDuplicateKeyError = {
  code: number;
};

type PopulatedRoomType = Pick<
  RoomTypeDocument,
  "_id" | "capacity" | "isActive" | "name"
>;

type PopulatedRoomDocument = Omit<RoomDocument, "roomType"> & {
  roomType: PopulatedRoomType;
};

const HOUSEKEEPING_ALLOWED_STATUSES = new Set<RoomStatus>([
  RoomStatus.Available,
  RoomStatus.Cleaning,
  RoomStatus.Dirty,
]);

function isMongoDuplicateKeyError(
  error: unknown,
): error is MongoDuplicateKeyError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as MongoDuplicateKeyError).code === 11000
  );
}

@Injectable()
export class RoomsService {
  constructor(
    @InjectModel(Room.name)
    private readonly roomModel: Model<RoomDocument>,
    @InjectModel(RoomType.name)
    private readonly roomTypeModel: Model<RoomTypeDocument>,
  ) {}

  async listRooms(query: ListRoomsQueryDto = {}): Promise<StaffRoom[]> {
    const filters: Record<string, unknown> = {};

    if (query.status !== undefined) {
      filters.status = query.status;
    }

    if (query.roomTypeId !== undefined) {
      this.assertValidObjectId(query.roomTypeId, "Invalid room type id");
      filters.roomType = query.roomTypeId;
    }

    if (query.floor !== undefined && query.floor.trim().length > 0) {
      filters.floor = query.floor.trim();
    }

    const rooms = await this.roomModel
      .find(filters)
      .populate<{ roomType: PopulatedRoomType }>("roomType")
      .sort({ floor: 1, roomNumber: 1 })
      .exec();

    return rooms.map((room) => this.toStaffRoom(room));
  }

  async getRoom(roomId: string): Promise<StaffRoom> {
    const room = await this.findRoomById(roomId);

    return this.toStaffRoom(room);
  }

  async createRoom(dto: CreateRoomDto): Promise<StaffRoom> {
    await this.assertRoomTypeExists(dto.roomTypeId);

    try {
      const room = await this.roomModel.create({
        roomNumber: dto.roomNumber,
        roomType: new Types.ObjectId(dto.roomTypeId),
        floor: dto.floor,
        notes: dto.notes,
        status: dto.status ?? RoomStatus.Available,
      });

      return this.getRoom(room._id.toString());
    } catch (error) {
      if (isMongoDuplicateKeyError(error)) {
        throw new BadRequestException("Room number already exists");
      }

      throw error;
    }
  }

  async updateRoom(roomId: string, dto: UpdateRoomDto): Promise<StaffRoom> {
    this.assertValidObjectId(roomId, "Invalid room id");

    const update: Partial<Room> = {};

    if (dto.roomNumber !== undefined) {
      update.roomNumber = dto.roomNumber;
    }

    if (dto.roomTypeId !== undefined) {
      await this.assertRoomTypeExists(dto.roomTypeId);
      update.roomType = new Types.ObjectId(dto.roomTypeId);
    }

    if (dto.floor !== undefined) {
      update.floor = dto.floor;
    }

    if (dto.notes !== undefined) {
      update.notes = dto.notes;
    }

    if (Object.keys(update).length === 0) {
      throw new BadRequestException("At least one room field is required");
    }

    try {
      const room = await this.roomModel
        .findByIdAndUpdate(
          roomId,
          { $set: update },
          { new: true, runValidators: true },
        )
        .populate<{ roomType: PopulatedRoomType }>("roomType")
        .exec();

      if (!room) {
        throw new NotFoundException("Room not found");
      }

      return this.toStaffRoom(room);
    } catch (error) {
      if (isMongoDuplicateKeyError(error)) {
        throw new BadRequestException("Room number already exists");
      }

      throw error;
    }
  }

  async updateRoomStatus(
    roomId: string,
    status: RoomStatus,
    actorRole: UserRole,
  ): Promise<StaffRoom> {
    this.assertValidObjectId(roomId, "Invalid room id");

    if (
      actorRole === UserRole.Housekeeping &&
      !HOUSEKEEPING_ALLOWED_STATUSES.has(status)
    ) {
      throw new ForbiddenException(
        "Housekeeping can only update cleaning-related room statuses",
      );
    }

    const room = await this.roomModel
      .findByIdAndUpdate(
        roomId,
        { $set: { status } },
        { new: true, runValidators: true },
      )
      .populate<{ roomType: PopulatedRoomType }>("roomType")
      .exec();

    if (!room) {
      throw new NotFoundException("Room not found");
    }

    return this.toStaffRoom(room);
  }

  private async findRoomById(roomId: string): Promise<PopulatedRoomDocument> {
    this.assertValidObjectId(roomId, "Invalid room id");

    const room = await this.roomModel
      .findById(roomId)
      .populate<{ roomType: PopulatedRoomType }>("roomType")
      .exec();

    if (!room) {
      throw new NotFoundException("Room not found");
    }

    return room;
  }

  private async assertRoomTypeExists(roomTypeId: string): Promise<void> {
    this.assertValidObjectId(roomTypeId, "Invalid room type id");

    const exists = await this.roomTypeModel.exists({
      _id: roomTypeId,
      isActive: true,
    });

    if (!exists) {
      throw new BadRequestException("Room type does not exist");
    }
  }

  private assertValidObjectId(value: string, message: string): void {
    if (!isValidObjectId(value)) {
      throw new BadRequestException(message);
    }
  }

  private toStaffRoom(room: PopulatedRoomDocument): StaffRoom {
    return {
      id: room._id.toString(),
      roomNumber: room.roomNumber,
      floor: room.floor,
      notes: room.notes,
      status: room.status,
      roomType: {
        id: room.roomType._id.toString(),
        name: room.roomType.name,
        capacity: room.roomType.capacity,
        isActive: room.roomType.isActive,
      },
    };
  }
}

export default RoomsService;


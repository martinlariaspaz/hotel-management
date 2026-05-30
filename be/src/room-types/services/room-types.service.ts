import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, isValidObjectId } from "mongoose";
import { CreateRoomTypeDto, UpdateRoomTypeDto } from "../dto";
import { RoomType, RoomTypeDocument } from "../schemas/room-type.schema";
import type { AdminRoomType, PublicRoomType } from "../types";

type MongoDuplicateKeyError = {
  code: number;
};

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
export class RoomTypesService {
  constructor(
    @InjectModel(RoomType.name)
    private readonly roomTypeModel: Model<RoomTypeDocument>,
  ) {}

  async listPublicRoomTypes(): Promise<PublicRoomType[]> {
    const roomTypes = await this.roomTypeModel
      .find({ isActive: true })
      .sort({ name: 1 })
      .exec();

    return roomTypes.map((roomType) => this.toPublicRoomType(roomType));
  }

  async getPublicRoomType(roomTypeId: string): Promise<PublicRoomType> {
    const roomType = await this.findRoomTypeById(roomTypeId, {
      isActive: true,
    });

    return this.toPublicRoomType(roomType);
  }

  async listAdminRoomTypes(): Promise<AdminRoomType[]> {
    const roomTypes = await this.roomTypeModel
      .find({})
      .sort({ name: 1 })
      .exec();

    return roomTypes.map((roomType) => this.toAdminRoomType(roomType));
  }

  async getAdminRoomType(roomTypeId: string): Promise<AdminRoomType> {
    const roomType = await this.findRoomTypeById(roomTypeId);

    return this.toAdminRoomType(roomType);
  }

  async createRoomType(dto: CreateRoomTypeDto): Promise<AdminRoomType> {
    try {
      const roomType = await this.roomTypeModel.create({
        name: dto.name,
        capacity: dto.capacity,
        amenities: dto.amenities ?? [],
        photoUrls: dto.photoUrls ?? [],
        baseNightlyRate: dto.baseNightlyRate,
        isActive: dto.isActive ?? true,
      });

      return this.toAdminRoomType(roomType);
    } catch (error) {
      if (isMongoDuplicateKeyError(error)) {
        throw new BadRequestException("Room type name already exists");
      }

      throw error;
    }
  }

  async updateRoomType(
    roomTypeId: string,
    dto: UpdateRoomTypeDto,
  ): Promise<AdminRoomType> {
    this.assertValidRoomTypeId(roomTypeId);

    const update: Partial<RoomType> = {};

    if (dto.name !== undefined) {
      update.name = dto.name;
    }

    if (dto.capacity !== undefined) {
      update.capacity = dto.capacity;
    }

    if (dto.amenities !== undefined) {
      update.amenities = dto.amenities;
    }

    if (dto.photoUrls !== undefined) {
      update.photoUrls = dto.photoUrls;
    }

    if (dto.baseNightlyRate !== undefined) {
      update.baseNightlyRate = dto.baseNightlyRate;
    }

    if (dto.isActive !== undefined) {
      update.isActive = dto.isActive;
    }

    if (Object.keys(update).length === 0) {
      throw new BadRequestException("At least one room type field is required");
    }

    try {
      const roomType = await this.roomTypeModel
        .findByIdAndUpdate(
          roomTypeId,
          { $set: update },
          { new: true, runValidators: true },
        )
        .exec();

      if (!roomType) {
        throw new NotFoundException("Room type not found");
      }

      return this.toAdminRoomType(roomType);
    } catch (error) {
      if (isMongoDuplicateKeyError(error)) {
        throw new BadRequestException("Room type name already exists");
      }

      throw error;
    }
  }

  async deactivateRoomType(roomTypeId: string): Promise<AdminRoomType> {
    this.assertValidRoomTypeId(roomTypeId);

    const roomType = await this.roomTypeModel
      .findByIdAndUpdate(
        roomTypeId,
        { $set: { isActive: false } },
        { new: true, runValidators: true },
      )
      .exec();

    if (!roomType) {
      throw new NotFoundException("Room type not found");
    }

    return this.toAdminRoomType(roomType);
  }

  private async findRoomTypeById(
    roomTypeId: string,
    filters: Partial<Pick<RoomType, "isActive">> = {},
  ): Promise<RoomTypeDocument> {
    this.assertValidRoomTypeId(roomTypeId);

    const roomType = await this.roomTypeModel
      .findOne({ _id: roomTypeId, ...filters })
      .exec();

    if (!roomType) {
      throw new NotFoundException("Room type not found");
    }

    return roomType;
  }

  private assertValidRoomTypeId(roomTypeId: string): void {
    if (!isValidObjectId(roomTypeId)) {
      throw new BadRequestException("Invalid room type id");
    }
  }

  private toPublicRoomType(roomType: RoomTypeDocument): PublicRoomType {
    return {
      id: roomType._id.toString(),
      name: roomType.name,
      capacity: roomType.capacity,
      amenities: [...roomType.amenities],
      photoUrls: [...roomType.photoUrls],
      baseNightlyRate: roomType.baseNightlyRate,
    };
  }

  private toAdminRoomType(roomType: RoomTypeDocument): AdminRoomType {
    return {
      ...this.toPublicRoomType(roomType),
      isActive: roomType.isActive,
    };
  }
}

export default RoomTypesService;


import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { randomBytes, scryptSync } from "node:crypto";
import { Model, isValidObjectId } from "mongoose";
import {
  REALTIME_EVENT_NAMES,
  RealtimeGateway,
} from "../../realtime/realtime.gateway";
import { CreateStaffUserDto } from "../dto/create-staff-user.dto";
import { UpdateStaffUserDto } from "../dto/update-staff-user.dto";
import { User, UserDocument } from "../schemas/user.schema";
import type { StaffUser } from "../types/staff-user.types";

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
export class StaffUsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @Optional()
    private readonly realtimeGateway?: RealtimeGateway,
  ) {}

  async listStaffUsers(): Promise<StaffUser[]> {
    const users = await this.userModel.find({}).sort({ username: 1 }).exec();

    return users.map((user) => this.toStaffUser(user));
  }

  async createStaffUser(dto: CreateStaffUserDto): Promise<StaffUser> {
    const { passwordHash, passwordSalt } = this.hashPassword(dto.password);

    try {
      const user = await this.userModel.create({
        username: dto.username,
        role: dto.role,
        isActive: dto.isActive ?? true,
        passwordAlgorithm: "scrypt",
        passwordHash,
        passwordSalt,
      });

      const staffUser = this.toStaffUser(user);

      this.emitStaffUserChanged("created", staffUser.id);

      return staffUser;
    } catch (error) {
      if (isMongoDuplicateKeyError(error)) {
        throw new BadRequestException("Username already exists");
      }

      throw error;
    }
  }

  async updateStaffUser(
    userId: string,
    dto: UpdateStaffUserDto,
  ): Promise<StaffUser> {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException("Invalid staff user id");
    }

    const update: Partial<Pick<User, "isActive" | "role">> = {};

    if (dto.role !== undefined) {
      update.role = dto.role;
    }

    if (dto.isActive !== undefined) {
      update.isActive = dto.isActive;
    }

    if (Object.keys(update).length === 0) {
      throw new BadRequestException(
        "At least one staff user field is required",
      );
    }

    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { $set: update },
        { new: true, runValidators: true },
      )
      .exec();

    if (!user) {
      throw new NotFoundException("Staff user not found");
    }

    const staffUser = this.toStaffUser(user);

    this.emitStaffUserChanged("updated", staffUser.id);

    return staffUser;
  }

  private hashPassword(password: string): {
    passwordHash: string;
    passwordSalt: string;
  } {
    const salt = randomBytes(16);
    const hash = scryptSync(password, salt, 64);

    return {
      passwordHash: hash.toString("base64"),
      passwordSalt: salt.toString("base64"),
    };
  }

  private toStaffUser(user: UserDocument): StaffUser {
    return {
      id: user._id.toString(),
      username: user.username,
      role: user.role,
      isActive: user.isActive,
    };
  }

  private emitStaffUserChanged(
    action: "created" | "updated",
    staffUserId: string,
  ): void {
    this.realtimeGateway?.emitMutationEvent(
      REALTIME_EVENT_NAMES.StaffUsersChanged,
      {
        action,
        entity: "staff-user",
        id: staffUserId,
      },
    );
  }
}

export default StaffUsersService;

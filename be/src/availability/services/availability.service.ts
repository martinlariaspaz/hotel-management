import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types, isValidObjectId } from "mongoose";
import {
  MaintenanceBlockStatus,
  ReservationStatus,
  RoomStatus,
} from "../../common/enums";
import { HotelBusinessConflictException } from "../../common/errors";
import {
  MaintenanceBlock,
  MaintenanceBlockDocument,
} from "../../maintenance-blocks/schemas";
import {
  Reservation,
  ReservationDocument,
  ReservationSource,
} from "../../reservations/schemas";
import {
  RoomType,
  RoomTypeDocument,
} from "../../room-types/schemas/room-type.schema";
import { Room, RoomDocument } from "../../rooms/schemas";
import type {
  AssignableRoom,
  AssignableRoomsResponse,
  PublicAvailabilityResponse,
  PublicRoomTypeAvailability,
} from "../types";
import {
  StayDateRange,
  StayDateRangeValidationError,
  validateStayDateRange,
} from "../utils";

type AvailabilityQuery = {
  checkIn: string;
  checkOut: string;
  guests: number;
};

type AssignableRoomsQuery = AvailabilityQuery & {
  reservationId?: string;
  roomTypeId: string;
};

type RoomInventoryDocument = Pick<
  RoomDocument,
  "_id" | "floor" | "roomNumber" | "roomType" | "status"
>;

type ReservationBlockDocument = Pick<
  ReservationDocument,
  "_id" | "room" | "roomType"
>;

type MaintenanceBlockRoomDocument = Pick<MaintenanceBlockDocument, "room">;

const AVAILABILITY_CURRENCY = "ARS";
const FREE_CANCELLATION_HOURS_BEFORE_CHECK_IN = 48;
const BLOCKING_RESERVATION_STATUSES = [
  ReservationStatus.PendingConfirmation,
  ReservationStatus.Confirmed,
  ReservationStatus.CheckedIn,
] as const;
const UNAVAILABLE_ROOM_STATUSES = [
  RoomStatus.Maintenance,
  RoomStatus.OutOfService,
] as const;
const UNAVAILABLE_ROOM_STATUS_SET = new Set<RoomStatus>(
  UNAVAILABLE_ROOM_STATUSES,
);

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectModel(RoomType.name)
    private readonly roomTypeModel: Model<RoomTypeDocument>,
    @InjectModel(Room.name)
    private readonly roomModel: Model<RoomDocument>,
    @InjectModel(Reservation.name)
    private readonly reservationModel: Model<ReservationDocument>,
    @InjectModel(MaintenanceBlock.name)
    private readonly maintenanceBlockModel: Model<MaintenanceBlockDocument>,
  ) {}

  async getPublicAvailability(
    query: AvailabilityQuery,
  ): Promise<PublicAvailabilityResponse> {
    const stay = this.getValidatedStay(query.checkIn, query.checkOut);
    const now = new Date();

    this.assertValidGuestCount(query.guests);
    await this.expirePendingPublicReservations(now);

    const roomTypes = await this.roomTypeModel
      .find({ isActive: true, capacity: { $gte: query.guests } })
      .sort({ baseNightlyRate: 1, name: 1 })
      .exec();
    const roomTypeIds = roomTypes.map((roomType) => roomType._id);

    if (roomTypeIds.length === 0) {
      return {
        checkIn: stay.checkInDate,
        checkOut: stay.checkOutDate,
        currency: AVAILABILITY_CURRENCY,
        guests: query.guests,
        nights: stay.nights,
        roomTypes: [],
      };
    }

    const [candidateRooms, blockingReservations] = await Promise.all([
      this.findCandidateRoomsByRoomType(roomTypeIds),
      this.findBlockingReservationsByRoomType(roomTypeIds, stay, now),
    ]);
    const maintenanceBlockedRoomIds = await this.findMaintenanceBlockedRoomIds(
      candidateRooms.map((room) => room._id),
      stay,
    );
    const physicalRoomCounts = this.countAvailableRoomsByRoomType(
      candidateRooms,
      maintenanceBlockedRoomIds,
    );
    const reservationCounts =
      this.countBlockingReservationsByRoomType(blockingReservations);

    return {
      checkIn: stay.checkInDate,
      checkOut: stay.checkOutDate,
      currency: AVAILABILITY_CURRENCY,
      guests: query.guests,
      nights: stay.nights,
      roomTypes: roomTypes.map((roomType) =>
        this.toPublicRoomTypeAvailability(
          roomType,
          stay,
          physicalRoomCounts.get(roomType._id.toString()) ?? 0,
          reservationCounts.get(roomType._id.toString()) ?? 0,
        ),
      ),
    };
  }

  async getAssignableRooms(
    query: AssignableRoomsQuery,
  ): Promise<AssignableRoomsResponse> {
    const stay = this.getValidatedStay(query.checkIn, query.checkOut);
    const now = new Date();

    this.assertValidGuestCount(query.guests);
    this.assertValidObjectId(query.roomTypeId, "Invalid room type id");

    if (query.reservationId !== undefined) {
      this.assertValidObjectId(query.reservationId, "Invalid reservation id");
    }

    const roomType = await this.roomTypeModel
      .findOne({
        _id: new Types.ObjectId(query.roomTypeId),
        isActive: true,
      })
      .exec();

    if (!roomType) {
      throw new NotFoundException("Room type not found");
    }

    if (query.guests > roomType.capacity) {
      throw new HotelBusinessConflictException(
        "Guest count exceeds room type capacity",
        {
          capacity: roomType.capacity,
          guests: query.guests,
          roomTypeId: query.roomTypeId,
        },
        "ROOM_TYPE_CAPACITY_EXCEEDED",
      );
    }

    await this.expirePendingPublicReservations(now);

    const candidateRooms = await this.roomModel
      .find({
        roomType: roomType._id,
        status: { $nin: UNAVAILABLE_ROOM_STATUSES },
      })
      .select("_id floor roomNumber roomType status")
      .sort({ floor: 1, roomNumber: 1 })
      .exec();
    const candidateRoomIds = candidateRooms.map((room) => room._id);
    const [maintenanceBlockedRoomIds, reservationBlockedRoomIds] =
      await Promise.all([
        this.findMaintenanceBlockedRoomIds(candidateRoomIds, stay),
        this.findReservationBlockedRoomIds(
          candidateRoomIds,
          stay,
          now,
          query.reservationId,
        ),
      ]);

    return {
      checkIn: stay.checkInDate,
      checkOut: stay.checkOutDate,
      guests: query.guests,
      nights: stay.nights,
      reservationId: query.reservationId,
      roomTypeId: query.roomTypeId,
      rooms: candidateRooms
        .filter((room) => {
          const roomId = room._id.toString();

          return (
            !UNAVAILABLE_ROOM_STATUS_SET.has(room.status) &&
            !maintenanceBlockedRoomIds.has(roomId) &&
            !reservationBlockedRoomIds.has(roomId)
          );
        })
        .map((room) => this.toAssignableRoom(room, roomType)),
    };
  }

  private async findCandidateRoomsByRoomType(
    roomTypeIds: Types.ObjectId[],
  ): Promise<RoomInventoryDocument[]> {
    return this.roomModel
      .find({
        roomType: { $in: roomTypeIds },
        status: { $nin: UNAVAILABLE_ROOM_STATUSES },
      })
      .select("_id floor roomNumber roomType status")
      .exec();
  }

  private async findBlockingReservationsByRoomType(
    roomTypeIds: Types.ObjectId[],
    stay: StayDateRange,
    now: Date,
  ): Promise<ReservationBlockDocument[]> {
    return this.reservationModel
      .find({
        roomType: { $in: roomTypeIds },
        checkInDate: { $lt: stay.checkOut },
        checkOutDate: { $gt: stay.checkIn },
        ...this.getBlockingReservationStateFilter(now),
      })
      .select("_id room roomType")
      .exec();
  }

  private async findMaintenanceBlockedRoomIds(
    roomIds: Types.ObjectId[],
    stay: StayDateRange,
  ): Promise<Set<string>> {
    if (roomIds.length === 0) {
      return new Set<string>();
    }

    const maintenanceBlocks = await this.maintenanceBlockModel
      .find({
        room: { $in: roomIds },
        status: MaintenanceBlockStatus.Active,
        startDate: { $lt: stay.checkOut },
        endDate: { $gt: stay.checkIn },
      })
      .select("room")
      .exec();

    return new Set(
      maintenanceBlocks.map((maintenanceBlock) =>
        maintenanceBlock.room.toString(),
      ),
    );
  }

  private async findReservationBlockedRoomIds(
    roomIds: Types.ObjectId[],
    stay: StayDateRange,
    now: Date,
    excludedReservationId?: string,
  ): Promise<Set<string>> {
    if (roomIds.length === 0) {
      return new Set<string>();
    }

    const filters: Record<string, unknown> = {
      room: { $in: roomIds },
      checkInDate: { $lt: stay.checkOut },
      checkOutDate: { $gt: stay.checkIn },
      ...this.getBlockingReservationStateFilter(now),
    };

    if (excludedReservationId !== undefined) {
      filters._id = { $ne: new Types.ObjectId(excludedReservationId) };
    }

    const reservations = await this.reservationModel
      .find(filters)
      .select("_id room")
      .exec();

    return new Set(
      reservations
        .filter((reservation) => reservation.room !== undefined)
        .map((reservation) => reservation.room!.toString()),
    );
  }

  private async expirePendingPublicReservations(now: Date): Promise<void> {
    await this.reservationModel
      .updateMany(
        {
          status: ReservationStatus.PendingConfirmation,
          source: ReservationSource.Public,
          expiresAt: { $lte: now },
          expiredAt: { $exists: false },
        },
        {
          $set: {
            status: ReservationStatus.Cancelled,
            expiredAt: now,
          },
        },
      )
      .exec();
  }

  private getBlockingReservationStateFilter(
    now: Date,
  ): Record<string, unknown> {
    return {
      status: { $in: BLOCKING_RESERVATION_STATUSES },
      $or: [
        { status: { $ne: ReservationStatus.PendingConfirmation } },
        { source: { $ne: ReservationSource.Public } },
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: now } },
      ],
    };
  }

  private countAvailableRoomsByRoomType(
    rooms: RoomInventoryDocument[],
    maintenanceBlockedRoomIds: Set<string>,
  ): Map<string, number> {
    const counts = new Map<string, number>();

    for (const room of rooms) {
      if (
        UNAVAILABLE_ROOM_STATUS_SET.has(room.status) ||
        maintenanceBlockedRoomIds.has(room._id.toString())
      ) {
        continue;
      }

      const roomTypeId = room.roomType.toString();
      counts.set(roomTypeId, (counts.get(roomTypeId) ?? 0) + 1);
    }

    return counts;
  }

  private countBlockingReservationsByRoomType(
    reservations: ReservationBlockDocument[],
  ): Map<string, number> {
    const counts = new Map<string, number>();

    for (const reservation of reservations) {
      const roomTypeId = reservation.roomType.toString();
      counts.set(roomTypeId, (counts.get(roomTypeId) ?? 0) + 1);
    }

    return counts;
  }

  private toPublicRoomTypeAvailability(
    roomType: RoomTypeDocument,
    stay: StayDateRange,
    physicalRoomCount: number,
    blockingReservationCount: number,
  ): PublicRoomTypeAvailability {
    const total = roomType.baseNightlyRate * stay.nights;
    const availableCount = Math.max(
      0,
      physicalRoomCount - blockingReservationCount,
    );

    return {
      id: roomType._id.toString(),
      name: roomType.name,
      capacity: roomType.capacity,
      amenities: [...roomType.amenities],
      photoUrls: [...roomType.photoUrls],
      baseNightlyRate: roomType.baseNightlyRate,
      availableCount,
      priceSummary: {
        currency: AVAILABILITY_CURRENCY,
        nightlyRate: roomType.baseNightlyRate,
        nights: stay.nights,
        subtotal: total,
        taxesAndFeesIncluded: true,
        total,
      },
      depositRule: {
        amount: roomType.baseNightlyRate,
        code: "FIRST_NIGHT_DEPOSIT",
        currency: AVAILABILITY_CURRENCY,
        description: "A first-night deposit is required for booking.",
        type: "first_night",
      },
      cancellationPolicy: {
        code: "FREE_CANCELLATION_UNTIL_48H_BEFORE_CHECK_IN",
        description:
          "Free cancellation is available until 48 hours before check-in. Late cancellations and no-shows may retain the first-night deposit.",
        freeCancellationUntilHoursBeforeCheckIn:
          FREE_CANCELLATION_HOURS_BEFORE_CHECK_IN,
        lateCancellationPenalty: "first_night_deposit",
        noShowPenalty: "first_night_deposit",
      },
    };
  }

  private toAssignableRoom(
    room: RoomInventoryDocument,
    roomType: RoomTypeDocument,
  ): AssignableRoom {
    return {
      id: room._id.toString(),
      roomNumber: room.roomNumber,
      floor: room.floor,
      status: room.status,
      roomType: {
        id: roomType._id.toString(),
        name: roomType.name,
        capacity: roomType.capacity,
      },
    };
  }

  private getValidatedStay(checkIn: string, checkOut: string): StayDateRange {
    try {
      return validateStayDateRange(checkIn, checkOut);
    } catch (error) {
      if (error instanceof StayDateRangeValidationError) {
        throw new BadRequestException(error.message);
      }

      throw error;
    }
  }

  private assertValidGuestCount(guests: number): void {
    if (!Number.isInteger(guests) || guests < 1) {
      throw new BadRequestException("Guest count must be a positive integer");
    }
  }

  private assertValidObjectId(value: string, message: string): void {
    if (!isValidObjectId(value)) {
      throw new BadRequestException(message);
    }
  }
}

export default AvailabilityService;

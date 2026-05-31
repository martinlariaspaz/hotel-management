import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Optional,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types, isValidObjectId } from "mongoose";
import type { PublicRoomTypeAvailability } from "../../availability/types";
import {
  StayDateRange,
  StayDateRangeValidationError,
  validateStayDateRange,
} from "../../availability/utils";
import { AvailabilityService } from "../../availability/services";
import { ReservationStatus } from "../../common/enums";
import { HotelBusinessConflictException } from "../../common/errors";
import { Guest, GuestDocument } from "../../guests/schemas";
import {
  RoomType,
  RoomTypeDocument,
} from "../../room-types/schemas/room-type.schema";
import { CreatePublicReservationDto } from "../dto";
import {
  Reservation,
  ReservationDocument,
  ReservationSource,
} from "../schemas";
import type { PublicReservationResponse } from "../types";

const PUBLIC_PENDING_EXPIRATION_HOURS = 24;
const PUBLIC_BOOKING_POLICY_VERSION = "public-booking-v1";
const MILLISECONDS_PER_HOUR = 60 * 60 * 1000;

type MongoDuplicateKeyError = {
  code: number;
};

type PublicGuestInput = {
  email: string;
  name: string;
  phone: string;
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
export class ReservationsService {
  constructor(
    @InjectModel(Reservation.name)
    private readonly reservationModel: Model<ReservationDocument>,
    @InjectModel(Guest.name)
    private readonly guestModel: Model<GuestDocument>,
    @InjectModel(RoomType.name)
    private readonly roomTypeModel: Model<RoomTypeDocument>,
    private readonly availabilityService: AvailabilityService,
    @Optional()
    private readonly getNow: () => Date = () => new Date(),
  ) {}

  async createPublicReservation(
    dto: CreatePublicReservationDto,
  ): Promise<PublicReservationResponse> {
    if (dto.policyAccepted !== true) {
      throw new BadRequestException("Booking policy must be accepted");
    }

    const stay = this.getValidatedStay(dto.checkInDate, dto.checkOutDate);

    this.assertValidGuestCount(dto.guestCount);
    this.assertValidObjectId(dto.roomTypeId, "Invalid room type id");

    const roomType = await this.roomTypeModel
      .findOne({
        _id: new Types.ObjectId(dto.roomTypeId),
        isActive: true,
      })
      .exec();

    if (!roomType) {
      throw new NotFoundException("Room type not found");
    }

    if (dto.guestCount > roomType.capacity) {
      throw new HotelBusinessConflictException(
        "Guest count exceeds room type capacity",
        {
          capacity: roomType.capacity,
          guests: dto.guestCount,
          roomTypeId: dto.roomTypeId,
        },
        "ROOM_TYPE_CAPACITY_EXCEEDED",
      );
    }

    const availability = await this.availabilityService.getPublicAvailability({
      checkIn: stay.checkInDate,
      checkOut: stay.checkOutDate,
      guests: dto.guestCount,
    });
    const availableRoomType = availability.roomTypes.find(
      (availableType) => availableType.id === dto.roomTypeId,
    );

    if (!availableRoomType || availableRoomType.availableCount < 1) {
      throw new HotelBusinessConflictException(
        "Room type is not available for the requested stay",
        {
          checkIn: stay.checkInDate,
          checkOut: stay.checkOutDate,
          guests: dto.guestCount,
          roomTypeId: dto.roomTypeId,
        },
        "ROOM_TYPE_NOT_AVAILABLE",
      );
    }

    const now = this.getNow();
    const expiresAt = this.addHours(now, PUBLIC_PENDING_EXPIRATION_HOURS);
    const guest = await this.findOrCreateGuest({
      email: dto.guest.email,
      name: dto.guest.name,
      phone: dto.guest.phone,
    });
    const reservation = await this.reservationModel.create({
      checkInDate: stay.checkIn,
      checkOutDate: stay.checkOut,
      guestCount: dto.guestCount,
      guest: guest._id,
      roomType: roomType._id,
      status: ReservationStatus.PendingConfirmation,
      totalAmount: availableRoomType.priceSummary.total,
      currency: availableRoomType.priceSummary.currency,
      notes: dto.notes,
      policyAccepted: true,
      policyAcceptedAt: now,
      policyVersion: PUBLIC_BOOKING_POLICY_VERSION,
      source: ReservationSource.Public,
      expiresAt,
      createdAt: now,
      updatedAt: now,
    });

    return this.toPublicReservationResponse(
      reservation,
      guest,
      availableRoomType,
      stay,
    );
  }

  private async findOrCreateGuest(input: PublicGuestInput) {
    const guestInput = {
      email: input.email.trim().toLowerCase(),
      name: input.name.trim(),
      phone: this.normalizePhone(input.phone),
    };
    const existingGuest = await this.findGuestByContact(
      guestInput.email,
      guestInput.phone,
    );

    if (existingGuest) {
      this.assertGuestContactMatches(existingGuest, guestInput);

      return existingGuest;
    }

    try {
      return await this.guestModel.create(guestInput);
    } catch (error) {
      if (isMongoDuplicateKeyError(error)) {
        const guest = await this.findGuestByContact(
          guestInput.email,
          guestInput.phone,
        );

        if (guest) {
          this.assertGuestContactMatches(guest, guestInput);

          return guest;
        }
      }

      throw error;
    }
  }

  private async findGuestByContact(
    email: string,
    phone: string,
  ): Promise<GuestDocument | null> {
    return this.guestModel
      .findOne({
        $or: [{ email }, { phone }],
      })
      .exec();
  }

  private assertGuestContactMatches(
    guest: GuestDocument,
    input: PublicGuestInput,
  ): void {
    if (guest.email === input.email && guest.phone === input.phone) {
      return;
    }

    throw new HotelBusinessConflictException(
      "Guest contact details already belong to another guest record",
      {
        email: input.email,
        phone: input.phone,
      },
      "GUEST_CONTACT_CONFLICT",
    );
  }

  private toPublicReservationResponse(
    reservation: ReservationDocument,
    guest: GuestDocument,
    roomType: PublicRoomTypeAvailability,
    stay: StayDateRange,
  ): PublicReservationResponse {
    return {
      id: reservation._id.toString(),
      reference: reservation.code ?? reservation._id.toString(),
      status: reservation.status,
      source: ReservationSource.Public,
      checkInDate: stay.checkInDate,
      checkOutDate: stay.checkOutDate,
      guestCount: reservation.guestCount,
      roomType: {
        id: roomType.id,
        name: roomType.name,
        capacity: roomType.capacity,
        amenities: [...roomType.amenities],
        photoUrls: [...roomType.photoUrls],
        baseNightlyRate: roomType.baseNightlyRate,
      },
      guest: {
        id: guest._id.toString(),
        name: guest.name,
        email: guest.email,
        phone: guest.phone,
      },
      currency: reservation.currency,
      totalAmount: reservation.totalAmount,
      priceSummary: roomType.priceSummary,
      depositRule: roomType.depositRule,
      cancellationPolicy: roomType.cancellationPolicy,
      expiresAt: reservation.expiresAt!.toISOString(),
      createdAt: reservation.createdAt.toISOString(),
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

  private addHours(date: Date, hours: number): Date {
    return new Date(date.getTime() + hours * MILLISECONDS_PER_HOUR);
  }

  private normalizePhone(value: string): string {
    return value.trim().replace(/[().\s-]/g, "");
  }
}

export default ReservationsService;

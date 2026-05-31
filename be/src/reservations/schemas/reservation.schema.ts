import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import {
  RESERVATION_STATUS_VALUES,
  ReservationStatus,
} from "../../common/enums";
import { Guest } from "../../guests/schemas";
import { RoomType } from "../../room-types/schemas/room-type.schema";
import { Room } from "../../rooms/schemas";

export enum ReservationSource {
  Public = "public",
  Staff = "staff",
}

export const RESERVATION_SOURCE_VALUES = Object.values(ReservationSource);

export type ReservationDocument = HydratedDocument<Reservation> & {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

@Schema({
  collection: "reservations",
  timestamps: true,
})
export class Reservation {
  @Prop({ required: true, index: true })
  checkInDate: Date;

  @Prop({ required: true, index: true })
  checkOutDate: Date;

  @Prop({ required: true, min: 1 })
  guestCount: number;

  @Prop({
    type: Types.ObjectId,
    ref: Guest.name,
    required: true,
    index: true,
  })
  guest: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: RoomType.name,
    required: true,
    index: true,
  })
  roomType: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: Room.name,
    index: true,
  })
  room?: Types.ObjectId;

  @Prop({
    required: true,
    enum: RESERVATION_STATUS_VALUES,
    default: ReservationStatus.PendingConfirmation,
    index: true,
  })
  status: ReservationStatus;

  @Prop({
    trim: true,
    uppercase: true,
    set: normalizeReservationCode,
  })
  code?: string;

  @Prop({ required: true, min: 0 })
  totalAmount: number;

  @Prop({ required: true, trim: true, uppercase: true, default: "ARS" })
  currency: string;

  @Prop({ trim: true, maxlength: 1000 })
  notes?: string;

  @Prop({ required: true, default: false })
  policyAccepted: boolean;

  @Prop()
  policyAcceptedAt?: Date;

  @Prop({ trim: true, maxlength: 80 })
  policyVersion?: string;

  @Prop({
    required: true,
    enum: RESERVATION_SOURCE_VALUES,
    default: ReservationSource.Public,
    index: true,
  })
  source: ReservationSource;

  @Prop({ index: true })
  expiresAt?: Date;

  @Prop()
  expiredAt?: Date;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);

ReservationSchema.index(
  { code: 1 },
  { unique: true, sparse: true, name: "unique_reservation_code" },
);
ReservationSchema.index(
  { guest: 1, checkInDate: -1 },
  { name: "reservation_guest_history" },
);
ReservationSchema.index(
  { roomType: 1, status: 1, checkInDate: 1, checkOutDate: 1 },
  { name: "reservation_room_type_availability" },
);
ReservationSchema.index(
  { room: 1, status: 1, checkInDate: 1, checkOutDate: 1 },
  {
    name: "reservation_room_assignment_availability",
    partialFilterExpression: { room: { $exists: true } },
  },
);
ReservationSchema.index(
  { status: 1, expiresAt: 1 },
  { name: "pending_reservation_expiry" },
);

ReservationSchema.path("notes").set(function normalizeOptionalString(
  value: string | undefined,
) {
  if (typeof value !== "string") {
    return value;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : undefined;
});

ReservationSchema.path("policyVersion").set(function normalizeOptionalString(
  value: string | undefined,
) {
  if (typeof value !== "string") {
    return value;
  }

  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : undefined;
});

ReservationSchema.pre("validate", function validateReservationDateRange() {
  if (this.checkInDate >= this.checkOutDate) {
    throw new Error("Reservation check-out date must be after check-in date");
  }
});

ReservationSchema.pre("validate", function validatePolicyAcceptance() {
  if (this.policyAcceptedAt && !this.policyAccepted) {
    throw new Error(
      "Reservation policy acceptance timestamp requires accepted policy",
    );
  }
});

function normalizeReservationCode(value: unknown): unknown {
  return typeof value === "string" ? value.trim().toUpperCase() : value;
}

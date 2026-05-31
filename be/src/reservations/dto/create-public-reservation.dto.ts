import { Transform, Type } from "class-transformer";
import {
  Equals,
  IsBoolean,
  IsEmail,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const GUEST_PHONE_PATTERN = /^\+?[1-9]\d{6,14}$/;

function trimString(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value;
}

function normalizeEmail(value: unknown): unknown {
  return typeof value === "string" ? value.trim().toLowerCase() : value;
}

function normalizePhone(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  return value.trim().replace(/[().\s-]/g, "");
}

export class PublicReservationGuestDto {
  @Transform(({ value }) => trimString(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @Transform(({ value }) => normalizeEmail(value))
  @IsEmail()
  @MaxLength(254)
  email: string;

  @Transform(({ value }) => normalizePhone(value))
  @IsString()
  @Matches(GUEST_PHONE_PATTERN)
  phone: string;
}

export class CreatePublicReservationDto {
  @IsMongoId()
  roomTypeId: string;

  @Matches(DATE_ONLY_PATTERN)
  checkInDate: string;

  @Matches(DATE_ONLY_PATTERN)
  checkOutDate: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  guestCount: number;

  @IsObject()
  @ValidateNested()
  @Type(() => PublicReservationGuestDto)
  guest: PublicReservationGuestDto;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsBoolean()
  @Equals(true)
  policyAccepted: boolean;
}

export default CreatePublicReservationDto;

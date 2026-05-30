import { Transform } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from "class-validator";

function trimString(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value;
}

function normalizeStringArray(value: unknown): unknown {
  if (!Array.isArray(value)) {
    return value;
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export class CreateRoomTypeDto {
  @Transform(({ value }) => trimString(value))
  @IsString()
  @IsNotEmpty()
  name: string;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  capacity: number;

  @IsOptional()
  @Transform(({ value }) => normalizeStringArray(value))
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  amenities?: string[];

  @IsOptional()
  @Transform(({ value }) => normalizeStringArray(value))
  @IsArray()
  @ArrayMaxSize(12)
  @IsUrl({ require_protocol: true }, { each: true })
  photoUrls?: string[];

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  baseNightlyRate: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export default CreateRoomTypeDto;

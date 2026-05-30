import { Transform } from "class-transformer";
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";

function trimString(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value;
}

export class UpdateRoomDto {
  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  @IsNotEmpty()
  roomNumber?: string;

  @IsOptional()
  @IsMongoId()
  roomTypeId?: string;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  floor?: string;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  notes?: string;
}

export default UpdateRoomDto;


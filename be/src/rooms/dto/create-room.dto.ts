import { Transform } from "class-transformer";
import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { RoomStatus } from "../../common/enums";

function trimString(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value;
}

export class CreateRoomDto {
  @Transform(({ value }) => trimString(value))
  @IsString()
  @IsNotEmpty()
  roomNumber: string;

  @IsMongoId()
  roomTypeId: string;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  floor?: string;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(RoomStatus)
  status?: RoomStatus;
}

export default CreateRoomDto;


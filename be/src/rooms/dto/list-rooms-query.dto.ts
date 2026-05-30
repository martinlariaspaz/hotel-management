import { Transform } from "class-transformer";
import { IsEnum, IsMongoId, IsOptional, IsString } from "class-validator";
import { RoomStatus } from "../../common/enums";

function trimString(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value;
}

export class ListRoomsQueryDto {
  @IsOptional()
  @IsEnum(RoomStatus)
  status?: RoomStatus;

  @IsOptional()
  @IsMongoId()
  roomTypeId?: string;

  @IsOptional()
  @Transform(({ value }) => trimString(value))
  @IsString()
  floor?: string;
}

export default ListRoomsQueryDto;


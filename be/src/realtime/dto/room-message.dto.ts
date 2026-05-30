import {
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";

export class RoomMessageDto {
  @IsString()
  @IsNotEmpty()
  room: string;

  @IsString()
  @MinLength(1)
  message: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

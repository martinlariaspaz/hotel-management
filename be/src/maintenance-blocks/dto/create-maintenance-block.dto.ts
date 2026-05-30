import { Transform } from "class-transformer";
import {
  IsMongoId,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from "class-validator";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function trimString(value: unknown): unknown {
  return typeof value === "string" ? value.trim() : value;
}

export class CreateMaintenanceBlockDto {
  @IsMongoId()
  roomId: string;

  @Matches(DATE_ONLY_PATTERN)
  startDate: string;

  @Matches(DATE_ONLY_PATTERN)
  endDate: string;

  @Transform(({ value }) => trimString(value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}

export default CreateMaintenanceBlockDto;

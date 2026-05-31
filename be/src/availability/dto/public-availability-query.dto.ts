import { Type } from "class-transformer";
import { IsInt, Matches, Min } from "class-validator";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export class PublicAvailabilityQueryDto {
  @Matches(DATE_ONLY_PATTERN)
  checkIn: string;

  @Matches(DATE_ONLY_PATTERN)
  checkOut: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  guests: number;
}

export default PublicAvailabilityQueryDto;

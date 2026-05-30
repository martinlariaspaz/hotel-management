import { IsEnum, IsMongoId, IsOptional, Matches } from "class-validator";
import { MaintenanceBlockStatus } from "../../common/enums";

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export class ListMaintenanceBlocksQueryDto {
  @IsOptional()
  @IsMongoId()
  roomId?: string;

  @IsOptional()
  @Matches(DATE_ONLY_PATTERN)
  startDate?: string;

  @IsOptional()
  @Matches(DATE_ONLY_PATTERN)
  endDate?: string;

  @IsOptional()
  @IsEnum(MaintenanceBlockStatus)
  status?: MaintenanceBlockStatus;
}

export default ListMaintenanceBlocksQueryDto;

import { IsBoolean, IsIn, IsOptional } from "class-validator";
import { USER_ROLES, type UserRole } from "../types/user-role.type";

export class UpdateStaffUserDto {
  @IsOptional()
  @IsIn(USER_ROLES)
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export default UpdateStaffUserDto;

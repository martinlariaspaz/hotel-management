import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";
import { USER_ROLES, type UserRole } from "../types/user-role.type";

export class CreateStaffUserDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsIn(USER_ROLES)
  role: UserRole;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export default CreateStaffUserDto;

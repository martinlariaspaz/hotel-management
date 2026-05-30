import { SetMetadata } from "@nestjs/common";
import type { UserRole } from "../types/user-role.type";

export const ROLES_KEY = "roles";

export function Roles(...roles: UserRole[]) {
  return SetMetadata(ROLES_KEY, roles);
}

export default Roles;

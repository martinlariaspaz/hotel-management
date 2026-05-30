import type { UserRole } from "./user-role.type";

export type StaffUser = {
  id: string;
  isActive: boolean;
  role: UserRole;
  username: string;
};

export type { StaffUser as default };

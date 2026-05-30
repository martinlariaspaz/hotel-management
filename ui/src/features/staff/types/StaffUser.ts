import type { UserRole } from '../../auth';

export type StaffUser = {
  id: string;
  isActive: boolean;
  role: UserRole;
  username: string;
};

export type { StaffUser as default };

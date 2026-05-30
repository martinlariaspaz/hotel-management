import type { UserRole } from '../../auth';
import type { StaffUser } from '../types';

export type CreateStaffUserInput = {
  isActive: boolean;
  password: string;
  role: UserRole;
  username: string;
};

export type UpdateStaffUserInput = {
  isActive?: boolean;
  role?: UserRole;
};

export type StaffRepository = {
  createStaffUser(
    token: string,
    input: CreateStaffUserInput,
  ): Promise<StaffUser>;
  listStaffUsers(token: string): Promise<StaffUser[]>;
  updateStaffUser(
    token: string,
    staffUserId: string,
    input: UpdateStaffUserInput,
  ): Promise<StaffUser>;
};

export type { StaffRepository as default };

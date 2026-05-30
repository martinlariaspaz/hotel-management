import type { UserRole } from './UserRole';

export type AuthUser = {
  id: string;
  username: string;
  role: UserRole;
};

export type { AuthUser as default };

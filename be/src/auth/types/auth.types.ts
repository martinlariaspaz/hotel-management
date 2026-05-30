import type { UserRole } from "./user-role.type";

export type AuthenticatedUser = {
  id: string;
  username: string;
  role: UserRole;
};

export type AuthJwtPayload = {
  sub: string;
  username: string;
  role: UserRole;
  jti?: string;
  iat?: number;
  exp?: number;
};

export type VerifiedAuthJwtPayload = AuthJwtPayload & {
  jti: string;
  exp: number;
};

export type AuthSession = {
  token: string;
  expiresAt: string;
  user: AuthenticatedUser;
};

export type AuthenticatedRequest = {
  headers: Record<string, string | string[] | undefined>;
  auth?: {
    token: string;
    payload: VerifiedAuthJwtPayload;
    user: AuthenticatedUser;
  };
};

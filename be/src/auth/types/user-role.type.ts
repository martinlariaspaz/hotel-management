export const USER_ROLES = ["admin", "owner", "employee"] as const;

export type UserRole = (typeof USER_ROLES)[number];

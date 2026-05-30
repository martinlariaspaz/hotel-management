export const USER_ROLE_VALUES = [
  'admin',
  'reception',
  'housekeeping',
  'management',
] as const;

export type UserRole = (typeof USER_ROLE_VALUES)[number];

export default USER_ROLE_VALUES;

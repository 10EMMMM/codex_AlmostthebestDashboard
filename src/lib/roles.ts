export const ROLE_SUPER_ADMIN = 'SUPER_ADMIN';
export const ROLE_ADMIN = 'ADMIN';
export const ROLE_BDR = 'BDR';
export const ROLE_ACCOUNT_MANAGER = 'ACCOUNT_MANAGER';
export const ROLE_TEAM_LEAD = 'TEAM_LEAD';

export const ASSIGNABLE_ROLES = [
  ROLE_ADMIN,
  ROLE_BDR,
  ROLE_ACCOUNT_MANAGER,
  ROLE_TEAM_LEAD,
] as const;

export const ADMIN_ACCESS_ROLES = [ROLE_ADMIN] as const;

export type Role = (typeof ASSIGNABLE_ROLES)[number];

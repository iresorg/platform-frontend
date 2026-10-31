// Target-build roles (replaces the old analyst/lead/customer set). The
// backend has no tier concept of its own — see lib/auth/roles.ts for how
// each is derived from the real permission codes GET /me returns, and the
// TIER_DERIVATION_IS_A_GUESS note there for what that means in practice.
export type UserRole = "tier1" | "tier2" | "admin" | "tenant_user" | "tenant_admin";

// Whether a role belongs to iRES staff (the analyst workspace) or a tenant
// (the client portal). Checked constantly, so it's a plain lookup rather
// than a repeated string comparison at every call site.
export const STAFF_ROLES: UserRole[] = ["tier1", "tier2", "admin"];
export const TENANT_ROLES: UserRole[] = ["tenant_user", "tenant_admin"];

export function isUserRole(value: unknown): value is UserRole {
  return STAFF_ROLES.includes(value as UserRole) || TENANT_ROLES.includes(value as UserRole);
}

export function isStaffRole(role: UserRole): boolean {
  return STAFF_ROLES.includes(role);
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  // Real-backend fields (absent on mock accounts). customer_id is the
  // active tenant's id.
  customer_id?: string;
  tenant_name?: string;
  permissions?: string[];
  session_id?: string;
  mfa_enabled?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: AuthUser;
}

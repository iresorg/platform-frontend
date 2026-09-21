export type UserRole = "analyst" | "lead" | "customer";

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
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: AuthUser;
}

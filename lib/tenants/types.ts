// RBAC / multi-tenancy API (api/v1/tenants, /me, /permissions,
// /invitations, /auth/switch-tenant). Every shape here is confirmed
// against real response samples.

export interface Envelope<T> {
  data: T;
}

export interface MessageResponse {
  message: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  status?: string;
  created_at?: string;
}

export interface Permission {
  id: string;
  code: string;
  name: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  is_system: boolean;
  // Permission *codes* (e.g. "alerts.view"), not ids.
  permissions: string[];
  created_at: string;
}

export interface MeResponse {
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    email_verified: boolean;
    mfa_enabled: boolean;
    created_at: string;
  };
  active_tenant: Tenant;
  tenants: Tenant[];
  // Permission codes granted in the active tenant.
  permissions: string[];
}

export interface SwitchTenantResponse {
  message: string;
  active_tenant: Tenant;
}

// CONFIRMED from a live response. `id` is the membership id (used in the
// role assign/unassign paths). Note there is no roles field here.
export interface Member {
  id: string;
  tenant: Tenant;
  user: MeResponse["user"];
  status: string;
  joined_at: string;
}

export interface Invitation {
  id: string;
  email: string;
  invited_by: MeResponse["user"];
  expires_at: string;
  accepted_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

// The single-use token is only returned here, at creation time.
export interface CreateInvitationResponse {
  invitation: Invitation;
  invitation_token: string;
}

export interface CreateTenantPayload {
  name: string;
  slug: string;
}

export interface SwitchTenantPayload {
  tenant_id: string;
}

export interface CreateRolePayload {
  name: string;
  permission_ids: string[];
}

export interface InviteMemberPayload {
  email: string;
}

export interface AcceptInvitationPayload {
  token: string;
}

import { apiRequest } from "@/lib/http";
import type {
  AcceptInvitationPayload,
  CreateInvitationResponse,
  CreateRolePayload,
  CreateTenantPayload,
  Envelope,
  InviteMemberPayload,
  MeResponse,
  Member,
  MessageResponse,
  Permission,
  Role,
  SwitchTenantPayload,
  SwitchTenantResponse,
  Tenant,
} from "@/lib/tenants/types";

async function unwrap<T>(promise: Promise<Envelope<T>>): Promise<T> {
  return (await promise).data;
}

// `token` is needed right after login, before the token is persisted.
export function getMe(token?: string): Promise<MeResponse> {
  return unwrap(apiRequest<Envelope<MeResponse>>("/api/v1/me", undefined, token));
}

export function getMyTenants(): Promise<Tenant[]> {
  return unwrap(apiRequest<Envelope<Tenant[]>>("/api/v1/me/tenants"));
}

export function getPermissions(): Promise<Permission[]> {
  return unwrap(apiRequest<Envelope<Permission[]>>("/api/v1/permissions"));
}

export function switchTenant(payload: SwitchTenantPayload): Promise<SwitchTenantResponse> {
  return apiRequest<SwitchTenantResponse>("/api/v1/auth/switch-tenant", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function createTenant(payload: CreateTenantPayload): Promise<Tenant> {
  return unwrap(
    apiRequest<Envelope<Tenant>>("/api/v1/tenants", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  );
}

export function getTenant(tenantId: string): Promise<Tenant> {
  return unwrap(apiRequest<Envelope<Tenant>>(`/api/v1/tenants/${tenantId}`));
}

export function getTenantRoles(tenantId: string): Promise<Role[]> {
  return unwrap(apiRequest<Envelope<Role[]>>(`/api/v1/tenants/${tenantId}/roles`));
}

export function createRole(tenantId: string, payload: CreateRolePayload): Promise<Role> {
  return unwrap(
    apiRequest<Envelope<Role>>(`/api/v1/tenants/${tenantId}/roles/create`, {
      method: "POST",
      body: JSON.stringify(payload),
    })
  );
}

// Assign takes the role id in the body; unassign (below) takes it in the
// path. The docs listed assign with the id in the path too, but that
// returns 405 — the body form is what the API actually accepts.
export function assignRole(
  tenantId: string,
  membershipId: string,
  roleId: string
): Promise<MessageResponse> {
  return apiRequest<MessageResponse>(
    `/api/v1/tenants/${tenantId}/members/${membershipId}/roles`,
    { method: "POST", body: JSON.stringify({ role_id: roleId }) }
  );
}

export function unassignRole(
  tenantId: string,
  membershipId: string,
  roleId: string
): Promise<MessageResponse> {
  return apiRequest<MessageResponse>(
    `/api/v1/tenants/${tenantId}/members/${membershipId}/roles/${roleId}`,
    { method: "DELETE" }
  );
}

export function getTenantMembers(tenantId: string): Promise<Member[]> {
  return unwrap(apiRequest<Envelope<Member[]>>(`/api/v1/tenants/${tenantId}/members`));
}

export function inviteMember(
  tenantId: string,
  payload: InviteMemberPayload
): Promise<CreateInvitationResponse> {
  return unwrap(
    apiRequest<Envelope<CreateInvitationResponse>>(
      `/api/v1/tenants/${tenantId}/invitations`,
      { method: "POST", body: JSON.stringify(payload) }
    )
  );
}

export function revokeInvitation(invitationId: string): Promise<MessageResponse> {
  return apiRequest<MessageResponse>(`/api/v1/invitations/${invitationId}/revoke`, {
    method: "POST",
  });
}

// Accepting returns the new membership.
export function acceptInvitation(
  token: string,
  payload: AcceptInvitationPayload
): Promise<Member> {
  return unwrap(
    apiRequest<Envelope<Member>>(`/api/v1/invitations/${token}/accept`, {
      method: "POST",
      body: JSON.stringify(payload),
    })
  );
}

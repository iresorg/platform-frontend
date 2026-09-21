"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptInvitation,
  assignRole,
  createRole,
  createTenant,
  getMyTenants,
  getPermissions,
  getTenant,
  getTenantMembers,
  getTenantRoles,
  inviteMember,
  revokeInvitation,
  switchTenant,
  unassignRole,
} from "@/lib/tenants/api";
import type {
  AcceptInvitationPayload,
  CreateRolePayload,
  CreateTenantPayload,
  InviteMemberPayload,
} from "@/lib/tenants/types";

export const tenantKeys = {
  mine: ["tenants", "mine"] as const,
  detail: (id: string) => ["tenants", "detail", id] as const,
  members: (id: string) => ["tenants", id, "members"] as const,
  roles: (id: string) => ["tenants", id, "roles"] as const,
  permissions: ["permissions"] as const,
};

export function useMyTenantsQuery() {
  return useQuery({ queryKey: tenantKeys.mine, queryFn: getMyTenants, retry: false });
}

export function useTenantQuery(id: string | undefined) {
  return useQuery({
    queryKey: tenantKeys.detail(id ?? ""),
    queryFn: () => getTenant(id as string),
    enabled: Boolean(id),
    retry: false,
  });
}

export function useMembersQuery(tenantId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: tenantKeys.members(tenantId ?? ""),
    queryFn: () => getTenantMembers(tenantId as string),
    enabled: Boolean(tenantId) && enabled,
    retry: false,
  });
}

export function useRolesQuery(tenantId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: tenantKeys.roles(tenantId ?? ""),
    queryFn: () => getTenantRoles(tenantId as string),
    enabled: Boolean(tenantId) && enabled,
    retry: false,
  });
}

export function usePermissionsQuery(enabled = true) {
  return useQuery({
    queryKey: tenantKeys.permissions,
    queryFn: getPermissions,
    enabled,
    retry: false,
    staleTime: 5 * 60_000,
  });
}

export function useSwitchTenantMutation() {
  return useMutation({ mutationFn: (tenantId: string) => switchTenant({ tenant_id: tenantId }) });
}

export function useCreateTenantMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTenantPayload) => createTenant(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tenantKeys.mine }),
  });
}

export function useInviteMemberMutation(tenantId: string) {
  return useMutation({
    mutationFn: (payload: InviteMemberPayload) => inviteMember(tenantId, payload),
  });
}

export function useRevokeInvitationMutation() {
  return useMutation({ mutationFn: (invitationId: string) => revokeInvitation(invitationId) });
}

export function useAcceptInvitationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ token, payload }: { token: string; payload: AcceptInvitationPayload }) =>
      acceptInvitation(token, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tenantKeys.mine }),
  });
}

export function useCreateRoleMutation(tenantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRolePayload) => createRole(tenantId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tenantKeys.roles(tenantId) }),
  });
}

export function useAssignRoleMutation(tenantId: string) {
  return useMutation({
    mutationFn: ({ membershipId, roleId }: { membershipId: string; roleId: string }) =>
      assignRole(tenantId, membershipId, roleId),
  });
}

export function useUnassignRoleMutation(tenantId: string) {
  return useMutation({
    mutationFn: ({ membershipId, roleId }: { membershipId: string; roleId: string }) =>
      unassignRole(tenantId, membershipId, roleId),
  });
}

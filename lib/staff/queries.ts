"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { disableStaff, fetchStaff, fetchStaffTenants, inviteStaff, setStaffTenants, updateStaff } from "@/lib/staff/api";
import type { InviteStaffPayload, UpdateStaffPayload } from "@/lib/staff/types";

export const staffKeys = {
  list: ["staff"] as const,
  tenants: (userId: string) => ["staff", userId, "tenants"] as const,
};

export function useStaffQuery(enabled = true) {
  return useQuery({ queryKey: staffKeys.list, queryFn: fetchStaff, enabled, retry: false });
}

export function useInviteStaffMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InviteStaffPayload) => inviteStaff(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: staffKeys.list }),
  });
}

export function useUpdateStaffMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UpdateStaffPayload }) => updateStaff(userId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: staffKeys.list }),
  });
}

export function useDisableStaffMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => disableStaff(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: staffKeys.list }),
  });
}

export function useStaffTenantsQuery(userId: string | undefined) {
  return useQuery({
    queryKey: staffKeys.tenants(userId ?? ""),
    queryFn: () => fetchStaffTenants(userId as string),
    enabled: Boolean(userId),
    retry: false,
  });
}

export function useSetStaffTenantsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, tenantIds }: { userId: string; tenantIds: string[] }) => setStaffTenants(userId, tenantIds),
    onSuccess: (_, { userId }) => {
      void queryClient.invalidateQueries({ queryKey: staffKeys.list });
      void queryClient.invalidateQueries({ queryKey: staffKeys.tenants(userId) });
    },
  });
}

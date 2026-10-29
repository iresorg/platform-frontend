"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { disableStaff, fetchStaff, inviteStaff, updateStaff } from "@/lib/staff/api";
import type { InviteStaffPayload, UpdateStaffPayload } from "@/lib/staff/types";

export const staffKeys = {
  list: ["staff"] as const,
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

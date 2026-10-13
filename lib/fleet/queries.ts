"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFleetToken, fetchFleetDevices, fetchFleetTokens, revokeFleetToken } from "@/lib/fleet/api";
import type { CreateEnrollmentTokenInput } from "@/lib/fleet/types";

const TOKENS_KEY = ["fleet", "tokens"] as const;
const DEVICES_KEY = ["fleet", "devices"] as const;

export function useFleetTokensQuery() {
  return useQuery({ queryKey: TOKENS_KEY, queryFn: fetchFleetTokens, retry: false });
}

export function useCreateFleetTokenMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEnrollmentTokenInput) => createFleetToken(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TOKENS_KEY }),
  });
}

export function useRevokeFleetTokenMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => revokeFleetToken(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TOKENS_KEY }),
  });
}

// Drives both the device inventory and the "enrolling now" panel (devices
// with status PENDING) — there's no separate pending-devices endpoint, so
// callers filter this list client-side.
export function useFleetDevicesQuery(poll = false) {
  return useQuery({
    queryKey: DEVICES_KEY,
    queryFn: fetchFleetDevices,
    retry: false,
    refetchInterval: poll ? 4000 : false,
  });
}

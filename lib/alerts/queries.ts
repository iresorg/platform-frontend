"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  escalateAlert,
  fetchAlert,
  fetchAlerts,
  fetchAlertStats,
  triageAlert,
} from "@/lib/alerts/api";
import type { AlertDetail, AlertFilters, EscalatePayload, TriagePayload } from "@/lib/alerts/types";
import { CASE_POLL_INTERVAL_MS, REALTIME_MODE } from "@/lib/config";

const POLL_REFETCH_INTERVAL =
  REALTIME_MODE === "poll" ? CASE_POLL_INTERVAL_MS : false;

export const alertKeys = {
  all: ["alerts"] as const,
  lists: () => [...alertKeys.all, "list"] as const,
  list: (filters?: AlertFilters) => [...alertKeys.lists(), filters ?? {}] as const,
  details: () => [...alertKeys.all, "detail"] as const,
  detail: (id: string) => [...alertKeys.details(), id] as const,
  stats: () => [...alertKeys.all, "stats"] as const,
};

export function useAlertsQuery(filters?: AlertFilters) {
  return useQuery({
    queryKey: alertKeys.list(filters),
    queryFn: () => fetchAlerts(filters),
    refetchInterval: POLL_REFETCH_INTERVAL,
    // Auth/CORS failures against the live backend won't resolve by
    // retrying — fail fast so the error state shows immediately.
    retry: false,
  });
}

export function useAlertQuery(id: string) {
  return useQuery({
    queryKey: alertKeys.detail(id),
    queryFn: () => fetchAlert(id),
    refetchInterval: POLL_REFETCH_INTERVAL,
    retry: false,
  });
}

export function useAlertStatsQuery() {
  return useQuery({
    queryKey: alertKeys.stats(),
    queryFn: () => fetchAlertStats(),
    refetchInterval: POLL_REFETCH_INTERVAL,
    retry: false,
  });
}

export function useTriageAlertMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TriagePayload }) =>
      triageAlert(id, payload),
    onSuccess: (updated, { id }) => {
      // The response is the updated alert — show the new status now
      // instead of waiting on a refetch. Merged, not replaced, in case
      // the response ever omits fields.
      queryClient.setQueryData<AlertDetail>(alertKeys.detail(id), (old) =>
        old ? { ...old, ...updated } : old
      );
      queryClient.invalidateQueries({ queryKey: alertKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: alertKeys.lists() });
      queryClient.invalidateQueries({ queryKey: alertKeys.stats() });
    },
  });
}

export function useEscalateAlertMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EscalatePayload }) =>
      escalateAlert(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: alertKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: alertKeys.lists() });
      queryClient.invalidateQueries({ queryKey: alertKeys.stats() });
    },
  });
}

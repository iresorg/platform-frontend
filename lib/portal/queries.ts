"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acknowledgePortalCase,
  fetchPortalCase,
  fetchPortalCases,
  fetchPortalEndpoints,
  fetchPortalOverview,
} from "@/lib/portal/api";
import type { PortalCaseDetail, PortalCaseStatus } from "@/lib/portal/types";
import { CASE_POLL_INTERVAL_MS, REALTIME_MODE } from "@/lib/config";

// Slower than the analyst side (30-60s vs 15-30s) — the guide calls this
// out explicitly: nothing on the portal is urgent to the second.
const PORTAL_POLL_INTERVAL_MS = CASE_POLL_INTERVAL_MS * 2;
const POLL_REFETCH_INTERVAL = REALTIME_MODE === "poll" ? PORTAL_POLL_INTERVAL_MS : false;

export const portalKeys = {
  all: ["portal"] as const,
  overview: () => [...portalKeys.all, "overview"] as const,
  cases: () => [...portalKeys.all, "cases"] as const,
  caseList: (status?: PortalCaseStatus, page?: number) => [...portalKeys.cases(), "list", status ?? "all", page ?? 1] as const,
  caseDetail: (id: string) => [...portalKeys.cases(), "detail", id] as const,
  endpoints: () => [...portalKeys.all, "endpoints"] as const,
};

export function usePortalOverviewQuery() {
  return useQuery({
    queryKey: portalKeys.overview(),
    queryFn: fetchPortalOverview,
    refetchInterval: POLL_REFETCH_INTERVAL,
    retry: false,
  });
}

export function usePortalCasesQuery(params?: { status?: PortalCaseStatus; page?: number; page_size?: number }) {
  return useQuery({
    queryKey: portalKeys.caseList(params?.status, params?.page),
    queryFn: () => fetchPortalCases(params),
    placeholderData: keepPreviousData,
    refetchInterval: POLL_REFETCH_INTERVAL,
    retry: false,
  });
}

export function usePortalCaseQuery(id: string) {
  return useQuery({
    queryKey: portalKeys.caseDetail(id),
    queryFn: () => fetchPortalCase(id),
    enabled: Boolean(id),
    refetchInterval: POLL_REFETCH_INTERVAL,
    retry: false,
  });
}

export function usePortalEndpointsQuery() {
  return useQuery({
    queryKey: portalKeys.endpoints(),
    queryFn: fetchPortalEndpoints,
    refetchInterval: POLL_REFETCH_INTERVAL,
    retry: false,
  });
}

export function useAcknowledgeCaseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => acknowledgePortalCase(id),
    onSuccess: (res, id) => {
      queryClient.setQueryData<PortalCaseDetail>(portalKeys.caseDetail(id), (old) =>
        old ? { ...old, acknowledged_at: res.acknowledged_at } : old
      );
      queryClient.invalidateQueries({ queryKey: portalKeys.overview() });
    },
  });
}

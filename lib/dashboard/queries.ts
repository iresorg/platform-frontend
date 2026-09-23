"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchDashboardEndpoints,
  fetchDashboardKpis,
  fetchProtectionStatus,
  fetchVulnerabilityPosture,
} from "@/lib/dashboard/api";
import { CASE_POLL_INTERVAL_MS, REALTIME_MODE } from "@/lib/config";

const POLL_REFETCH_INTERVAL =
  REALTIME_MODE === "poll" ? CASE_POLL_INTERVAL_MS : false;

export function useDashboardKpisQuery() {
  return useQuery({
    queryKey: ["dashboard", "kpis"],
    queryFn: fetchDashboardKpis,
    refetchInterval: POLL_REFETCH_INTERVAL,
    retry: false,
  });
}

export function useProtectionStatusQuery() {
  return useQuery({
    queryKey: ["dashboard", "protection-status"],
    queryFn: fetchProtectionStatus,
    refetchInterval: POLL_REFETCH_INTERVAL,
    retry: false,
  });
}

export function useVulnerabilityPostureQuery() {
  return useQuery({
    queryKey: ["dashboard", "vulnerability-posture"],
    queryFn: fetchVulnerabilityPosture,
    refetchInterval: POLL_REFETCH_INTERVAL,
    retry: false,
  });
}

export function useDashboardEndpointsQuery() {
  return useQuery({
    queryKey: ["dashboard", "endpoints"],
    queryFn: fetchDashboardEndpoints,
    refetchInterval: POLL_REFETCH_INTERVAL,
    retry: false,
  });
}

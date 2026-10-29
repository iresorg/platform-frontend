"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchMetricsOverview, fetchMetricsTopEndpoints, fetchMetricsTrend } from "@/lib/metrics/api";
import { CASE_POLL_INTERVAL_MS, REALTIME_MODE } from "@/lib/config";

const POLL_REFETCH_INTERVAL = REALTIME_MODE === "poll" ? CASE_POLL_INTERVAL_MS : false;

export function useMetricsOverviewQuery(customerId?: string) {
  return useQuery({
    queryKey: ["metrics", "overview", customerId ?? null] as const,
    queryFn: () => fetchMetricsOverview(customerId),
    refetchInterval: POLL_REFETCH_INTERVAL,
    retry: false,
  });
}

export function useMetricsTrendQuery(days = 7, customerId?: string) {
  return useQuery({
    queryKey: ["metrics", "trend", days, customerId ?? null] as const,
    queryFn: () => fetchMetricsTrend(days, customerId),
    refetchInterval: POLL_REFETCH_INTERVAL,
    retry: false,
  });
}

export function useMetricsTopEndpointsQuery(limit = 5, customerId?: string) {
  return useQuery({
    queryKey: ["metrics", "top-endpoints", limit, customerId ?? null] as const,
    queryFn: () => fetchMetricsTopEndpoints(limit, customerId),
    refetchInterval: POLL_REFETCH_INTERVAL,
    retry: false,
  });
}

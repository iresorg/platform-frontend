"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchMetricsOverview, fetchMetricsTopEndpoints, fetchMetricsTrend } from "@/lib/metrics/api";
import { CASE_POLL_INTERVAL_MS, REALTIME_MODE } from "@/lib/config";

const POLL_REFETCH_INTERVAL = REALTIME_MODE === "poll" ? CASE_POLL_INTERVAL_MS : false;

export function useMetricsOverviewQuery() {
  return useQuery({
    queryKey: ["metrics", "overview"] as const,
    queryFn: fetchMetricsOverview,
    refetchInterval: POLL_REFETCH_INTERVAL,
    retry: false,
  });
}

export function useMetricsTrendQuery(days = 7) {
  return useQuery({
    queryKey: ["metrics", "trend", days] as const,
    queryFn: () => fetchMetricsTrend(days),
    refetchInterval: POLL_REFETCH_INTERVAL,
    retry: false,
  });
}

export function useMetricsTopEndpointsQuery(limit = 5) {
  return useQuery({
    queryKey: ["metrics", "top-endpoints", limit] as const,
    queryFn: () => fetchMetricsTopEndpoints(limit),
    refetchInterval: POLL_REFETCH_INTERVAL,
    retry: false,
  });
}

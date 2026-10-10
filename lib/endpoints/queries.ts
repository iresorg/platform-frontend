"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchEndpoints } from "@/lib/endpoints/api";
import { CASE_POLL_INTERVAL_MS, REALTIME_MODE } from "@/lib/config";

const POLL_REFETCH_INTERVAL = REALTIME_MODE === "poll" ? CASE_POLL_INTERVAL_MS : false;

export function useEndpointsQuery(params?: { customer_id?: string; status?: string }) {
  return useQuery({
    queryKey: ["endpoints", params ?? {}] as const,
    queryFn: () => fetchEndpoints(params),
    refetchInterval: POLL_REFETCH_INTERVAL,
    retry: false,
  });
}

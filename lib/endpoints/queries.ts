"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCustomerEndpoints, fetchEndpoints } from "@/lib/endpoints/api";
import { CASE_POLL_INTERVAL_MS, REALTIME_MODE } from "@/lib/config";

const POLL_REFETCH_INTERVAL =
  REALTIME_MODE === "poll" ? CASE_POLL_INTERVAL_MS : false;

export const endpointKeys = {
  all: ["endpoints"] as const,
  customer: (customerId: string) =>
    ["endpoints", "customer", customerId] as const,
};

export function useEndpointsQuery() {
  return useQuery({
    queryKey: endpointKeys.all,
    queryFn: fetchEndpoints,
    refetchInterval: POLL_REFETCH_INTERVAL,
  });
}

export function useCustomerEndpointsQuery(customerId: string) {
  return useQuery({
    queryKey: endpointKeys.customer(customerId),
    queryFn: () => fetchCustomerEndpoints(customerId),
    refetchInterval: POLL_REFETCH_INTERVAL,
  });
}

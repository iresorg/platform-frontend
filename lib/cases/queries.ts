"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/auth-provider";
import { fetchCase, fetchCaseEvents, fetchCustomerCases } from "@/lib/cases/api";
import { CASE_POLL_INTERVAL_MS, REALTIME_MODE } from "@/lib/config";

const POLL_REFETCH_INTERVAL = REALTIME_MODE === "poll" ? CASE_POLL_INTERVAL_MS : false;

export const caseKeys = {
  all: ["customer-cases"] as const,
  list: (tenantId: string) => [...caseKeys.all, "list", tenantId] as const,
  detail: (id: string) => [...caseKeys.all, "detail", id] as const,
  events: (id: string) => [...caseKeys.all, "events", id] as const,
};

function useTenant() {
  const { user } = useAuth();
  return { id: user?.customer_id ?? "", name: user?.tenant_name ?? "Your organization" };
}

// customerId comes from the signed-in user's session, never from a URL.
export function useCustomerCasesQuery(customerId: string) {
  const tenant = useTenant();
  return useQuery({
    queryKey: caseKeys.list(customerId),
    queryFn: () => fetchCustomerCases(tenant),
    enabled: Boolean(customerId),
    refetchInterval: POLL_REFETCH_INTERVAL,
    retry: false,
  });
}

export function useCaseQuery(id: string) {
  const tenant = useTenant();
  return useQuery({
    queryKey: caseKeys.detail(id),
    queryFn: () => fetchCase(id, tenant),
    enabled: Boolean(tenant.id),
    refetchInterval: POLL_REFETCH_INTERVAL,
    retry: false,
  });
}

export function useCaseEventsQuery(id: string) {
  return useQuery({
    queryKey: caseKeys.events(id),
    queryFn: () => fetchCaseEvents(id),
    refetchInterval: POLL_REFETCH_INTERVAL,
    retry: false,
  });
}

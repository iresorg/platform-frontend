"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  disableCustomerUser,
  fetchCustomer,
  fetchCustomerEndpoints,
  fetchCustomerOnboarding,
  fetchCustomerUsers,
  fetchCustomers,
  inviteCustomerUser,
} from "@/lib/customers/api";
import type { InviteCustomerUserPayload } from "@/lib/customers/types";

export const customerKeys = {
  list: ["customers"] as const,
  detail: (id: string) => ["customers", id] as const,
  endpoints: (id: string) => ["customers", id, "endpoints"] as const,
  onboarding: (id: string) => ["customers", id, "onboarding"] as const,
  users: (id: string) => ["customers", id, "users"] as const,
};

export function useCustomersQuery() {
  return useQuery({ queryKey: customerKeys.list, queryFn: fetchCustomers, retry: false });
}

export function useCustomerQuery(id: string | undefined) {
  return useQuery({
    queryKey: customerKeys.detail(id ?? ""),
    queryFn: () => fetchCustomer(id as string),
    enabled: Boolean(id),
    retry: false,
  });
}

export function useCustomerEndpointsQuery(id: string | undefined) {
  return useQuery({
    queryKey: customerKeys.endpoints(id ?? ""),
    queryFn: () => fetchCustomerEndpoints(id as string),
    enabled: Boolean(id),
    retry: false,
  });
}

// Polled every 30s, per the addendum — only while an install is plausibly
// in progress; the caller decides when to enable this.
export function useCustomerOnboardingQuery(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: customerKeys.onboarding(id ?? ""),
    queryFn: () => fetchCustomerOnboarding(id as string),
    enabled: Boolean(id) && enabled,
    refetchInterval: 30_000,
    retry: false,
  });
}

export function useCustomerUsersQuery(id: string | undefined) {
  return useQuery({
    queryKey: customerKeys.users(id ?? ""),
    queryFn: () => fetchCustomerUsers(id as string),
    enabled: Boolean(id),
    retry: false,
  });
}

export function useInviteCustomerUserMutation(customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InviteCustomerUserPayload) => inviteCustomerUser(customerId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customerKeys.users(customerId) }),
  });
}

export function useDisableCustomerUserMutation(customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => disableCustomerUser(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customerKeys.users(customerId) }),
  });
}

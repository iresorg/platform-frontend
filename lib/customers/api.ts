import { apiRequest } from "@/lib/http";
import type {
  CustomerDetail,
  CustomerEndpoint,
  CustomerListItem,
  CustomerPortalUser,
  InviteCustomerUserPayload,
  OnboardingStatus,
} from "@/lib/customers/types";

export async function fetchCustomers(): Promise<CustomerListItem[]> {
  return apiRequest<CustomerListItem[]>("/api/v1/admin/customers");
}

export async function fetchCustomer(id: string): Promise<CustomerDetail> {
  return apiRequest<CustomerDetail>(`/api/v1/admin/customers/${id}`);
}

export async function fetchCustomerEndpoints(id: string): Promise<CustomerEndpoint[]> {
  return apiRequest<CustomerEndpoint[]>(`/api/v1/admin/customers/${id}/endpoints`);
}

export async function fetchCustomerOnboarding(id: string): Promise<OnboardingStatus> {
  return apiRequest<OnboardingStatus>(`/api/v1/admin/customers/${id}/onboarding`);
}

export async function fetchCustomerUsers(id: string): Promise<CustomerPortalUser[]> {
  return apiRequest<CustomerPortalUser[]>(`/api/v1/admin/customers/${id}/users`);
}

export async function inviteCustomerUser(
  id: string,
  payload: InviteCustomerUserPayload
): Promise<CustomerPortalUser> {
  return apiRequest<CustomerPortalUser>(`/api/v1/admin/customers/${id}/users`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function disableCustomerUser(userId: string): Promise<void> {
  await apiRequest<void>(`/api/v1/admin/users/${userId}/disable`, { method: "POST" });
}

import { apiRequest } from "@/lib/http";
import type {
  AdminCreateUserPayload,
  AdminCreateUserResponse,
  AdminCustomerDetail,
  AdminCustomerEndpoint,
  AdminCustomerList,
  AdminCustomerOnboardPayload,
  AdminCustomerOnboardResult,
  AdminCustomerOnboarding,
  AdminCustomerUser,
  DisableUserResponse,
} from "@/lib/customers/types";

// /admin/customers/* — confirmed live 19-20 Oct 2026. Unwrapped responses
// (no {data: ...} envelope), same as /fleet/*. No trailing slash on these
// paths, unlike most of this API — confirmed from the live schema.

export async function fetchCustomers(): Promise<AdminCustomerList[]> {
  return apiRequest<AdminCustomerList[]>("/api/v1/admin/customers");
}

export async function fetchCustomer(id: string): Promise<AdminCustomerDetail> {
  return apiRequest<AdminCustomerDetail>(`/api/v1/admin/customers/${id}`);
}

export async function fetchCustomerEndpoints(id: string): Promise<AdminCustomerEndpoint[]> {
  return apiRequest<AdminCustomerEndpoint[]>(`/api/v1/admin/customers/${id}/endpoints`);
}

export async function fetchCustomerOnboarding(id: string): Promise<AdminCustomerOnboarding> {
  return apiRequest<AdminCustomerOnboarding>(`/api/v1/admin/customers/${id}/onboarding`);
}

export async function fetchCustomerUsers(id: string): Promise<AdminCustomerUser[]> {
  return apiRequest<AdminCustomerUser[]>(`/api/v1/admin/customers/${id}/users`);
}

// Lead only — the backend enforces this; see lib/auth/permissions.ts for
// the UI-side mirror of that gate.
export async function createCustomerUser(
  id: string,
  payload: AdminCreateUserPayload
): Promise<AdminCreateUserResponse> {
  return apiRequest<AdminCreateUserResponse>(`/api/v1/admin/customers/${id}/users`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Lead only.
export async function disableCustomerUser(userId: string): Promise<DisableUserResponse> {
  return apiRequest<DisableUserResponse>(`/api/v1/admin/users/${userId}/disable`, { method: "POST" });
}

// Admin only. JSON body — the backend also accepts multipart/file, but a
// JSON POST does the same thing without needing to touch apiRequest's
// fixed Content-Type header.
export async function onboardCustomer(payload: AdminCustomerOnboardPayload): Promise<AdminCustomerOnboardResult> {
  return apiRequest<AdminCustomerOnboardResult>("/api/v1/admin/customers/onboard", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

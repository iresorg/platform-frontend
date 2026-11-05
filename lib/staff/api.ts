import { apiRequest } from "@/lib/http";
import type { AssignedTenant, InviteStaffPayload, InviteStaffResponse, StaffUser, UpdateStaffPayload } from "@/lib/staff/types";

// Admin only — anyone else gets a 403.

export async function fetchStaff(): Promise<StaffUser[]> {
  return apiRequest<StaffUser[]>("/api/v1/admin/staff");
}

export async function inviteStaff(payload: InviteStaffPayload): Promise<InviteStaffResponse> {
  return apiRequest<InviteStaffResponse>("/api/v1/admin/staff", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateStaff(userId: string, payload: UpdateStaffPayload): Promise<StaffUser> {
  return apiRequest<StaffUser>(`/api/v1/admin/staff/${userId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function disableStaff(userId: string): Promise<StaffUser> {
  return apiRequest<StaffUser>(`/api/v1/admin/staff/${userId}/disable`, { method: "POST" });
}

export async function fetchStaffTenants(userId: string): Promise<AssignedTenant[]> {
  return apiRequest<AssignedTenant[]>(`/api/v1/admin/staff/${userId}/tenants`);
}

// Replaces the whole set — anything left out is unassigned.
export async function setStaffTenants(userId: string, tenantIds: string[]): Promise<AssignedTenant[]> {
  return apiRequest<AssignedTenant[]>(`/api/v1/admin/staff/${userId}/tenants`, {
    method: "PUT",
    body: JSON.stringify({ tenant_ids: tenantIds }),
  });
}

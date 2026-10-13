import { apiRequest } from "@/lib/http";
import type { CreateEnrollmentTokenInput, EnrollmentToken, FleetDevice } from "@/lib/fleet/types";

// All of these are scoped to the caller's own active tenant (no tenant_id
// param exists on the backend) — confirmed live. A staff session only
// sees/manages the tenant it's currently switched into.

export async function fetchFleetTokens(): Promise<EnrollmentToken[]> {
  return apiRequest<EnrollmentToken[]>("/api/v1/fleet/tokens/");
}

export async function createFleetToken(input: CreateEnrollmentTokenInput): Promise<EnrollmentToken> {
  return apiRequest<EnrollmentToken>("/api/v1/fleet/tokens/", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function revokeFleetToken(id: string): Promise<EnrollmentToken> {
  return apiRequest<EnrollmentToken>(`/api/v1/fleet/tokens/${id}/`, {
    method: "PATCH",
    body: JSON.stringify({ is_revoked: true }),
  });
}

export async function fetchFleetDevices(): Promise<FleetDevice[]> {
  return apiRequest<FleetDevice[]>("/api/v1/fleet/devices/");
}

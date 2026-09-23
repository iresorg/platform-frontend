import { apiRequest } from "@/lib/http";
import type {
  DashboardKpis,
  EndpointCoverage,
  ProtectionStatus,
  VulnerabilityPosture,
} from "@/lib/dashboard/types";

type MaybeNested<T> = T[] | T[][];

function flattenOnce<T>(value: MaybeNested<T>): T[] {
  if (value.length > 0 && Array.isArray(value[0])) {
    return (value as T[][]).flat();
  }
  return value as T[];
}

export function fetchDashboardKpis(): Promise<DashboardKpis> {
  return apiRequest<DashboardKpis>("/api/v1/dashboard/kpis/");
}

export function fetchProtectionStatus(): Promise<ProtectionStatus> {
  return apiRequest<ProtectionStatus>("/api/v1/dashboard/protection-status/");
}

export function fetchVulnerabilityPosture(): Promise<VulnerabilityPosture> {
  return apiRequest<VulnerabilityPosture>("/api/v1/dashboard/vulnerability-posture/");
}

export async function fetchDashboardEndpoints(): Promise<EndpointCoverage[]> {
  const res = await apiRequest<MaybeNested<EndpointCoverage>>("/api/v1/dashboard/endpoints/");
  return flattenOnce(res);
}

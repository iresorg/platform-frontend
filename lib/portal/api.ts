import { apiRequest } from "@/lib/http";
import type { Paginated } from "@/lib/incidents/types";
import type {
  PortalAcknowledgeResponse,
  PortalCaseDetail,
  PortalCaseListItem,
  PortalCaseStatus,
  PortalEndpoint,
  PortalOverview,
} from "@/lib/portal/types";

export async function fetchPortalOverview(): Promise<PortalOverview> {
  return apiRequest<PortalOverview>("/api/v1/portal/overview");
}

export async function fetchPortalCases(params?: {
  status?: PortalCaseStatus;
  page?: number;
  page_size?: number;
}): Promise<Paginated<PortalCaseListItem>> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.page_size) qs.set("page_size", String(params.page_size));
  const q = qs.toString();
  return apiRequest<Paginated<PortalCaseListItem>>(`/api/v1/portal/cases${q ? `?${q}` : ""}`);
}

export async function fetchPortalCase(id: string): Promise<PortalCaseDetail> {
  return apiRequest<PortalCaseDetail>(`/api/v1/portal/cases/${id}`);
}

export async function fetchPortalEndpoints(): Promise<PortalEndpoint[]> {
  return apiRequest<PortalEndpoint[]>("/api/v1/portal/endpoints");
}

export async function acknowledgePortalCase(id: string): Promise<PortalAcknowledgeResponse> {
  return apiRequest<PortalAcknowledgeResponse>(`/api/v1/portal/cases/${id}/acknowledge`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

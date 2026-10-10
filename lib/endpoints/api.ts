import { apiRequest } from "@/lib/http";
import type { EndpointItem } from "@/lib/endpoints/types";

export async function fetchEndpoints(params?: { customer_id?: string; status?: string }): Promise<EndpointItem[]> {
  const qs = new URLSearchParams();
  if (params?.customer_id) qs.set("customer_id", params.customer_id);
  if (params?.status) qs.set("status", params.status);
  const q = qs.toString();
  return apiRequest<EndpointItem[]>(`/api/v1/endpoints${q ? `?${q}` : ""}`);
}

import { apiRequest } from "@/lib/http";
import type { MetricsOverview, MetricsTopEndpoint, MetricsTrendPoint } from "@/lib/metrics/types";

// Every metrics call takes an optional customer_id (tenant UUID or slug)
// to narrow to one customer.
function customerParam(customerId?: string): string {
  return customerId ? `customer_id=${encodeURIComponent(customerId)}` : "";
}

export async function fetchMetricsOverview(customerId?: string): Promise<MetricsOverview> {
  const qs = customerParam(customerId);
  return apiRequest<MetricsOverview>(`/api/v1/metrics/overview${qs ? `?${qs}` : ""}`);
}

// days: default 7, max 90 per the backend.
export async function fetchMetricsTrend(days = 7, customerId?: string): Promise<MetricsTrendPoint[]> {
  const qs = customerParam(customerId);
  return apiRequest<MetricsTrendPoint[]>(`/api/v1/metrics/trend?days=${days}${qs ? `&${qs}` : ""}`);
}

// limit: default 5, max 50 per the backend.
export async function fetchMetricsTopEndpoints(limit = 5, customerId?: string): Promise<MetricsTopEndpoint[]> {
  const qs = customerParam(customerId);
  return apiRequest<MetricsTopEndpoint[]>(`/api/v1/metrics/top-endpoints?limit=${limit}${qs ? `&${qs}` : ""}`);
}

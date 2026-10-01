import { apiRequest } from "@/lib/http";
import type { MetricsOverview, MetricsTopEndpoint, MetricsTrendPoint } from "@/lib/metrics/types";

export async function fetchMetricsOverview(): Promise<MetricsOverview> {
  return apiRequest<MetricsOverview>("/api/v1/metrics/overview");
}

// days: default 7, max 90 per the backend.
export async function fetchMetricsTrend(days = 7): Promise<MetricsTrendPoint[]> {
  return apiRequest<MetricsTrendPoint[]>(`/api/v1/metrics/trend?days=${days}`);
}

// limit: default 5, max 50 per the backend.
export async function fetchMetricsTopEndpoints(limit = 5): Promise<MetricsTopEndpoint[]> {
  return apiRequest<MetricsTopEndpoint[]>(`/api/v1/metrics/top-endpoints?limit=${limit}`);
}

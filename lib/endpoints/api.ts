import { clearAuth, getStoredToken } from "@/lib/auth/storage";
import { ApiError } from "@/lib/api-error";
import { API_BASE_URL, USE_MOCK_ENDPOINTS } from "@/lib/config";
import { mockEndpoints } from "@/lib/endpoints/mock-data";
import type { Endpoint } from "@/lib/endpoints/types";

const MOCK_LATENCY_MS = 300;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_LATENCY_MS));
}

async function request<T>(path: string): Promise<T> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (res.status === 401) {
    clearAuth();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("ires:unauthorized"));
    }
    throw new ApiError("Session expired", 401);
  }
  if (!res.ok) {
    throw new ApiError(res.statusText || "Request failed", res.status);
  }
  return res.json() as Promise<T>;
}

export async function fetchEndpoints(): Promise<Endpoint[]> {
  if (USE_MOCK_ENDPOINTS) return delay(mockEndpoints);
  return request<Endpoint[]>("/endpoints");
}

export async function fetchCustomerEndpoints(
  customerId: string
): Promise<Endpoint[]> {
  if (USE_MOCK_ENDPOINTS) {
    return delay(mockEndpoints.filter((e) => e.customer_id === customerId));
  }
  return request<Endpoint[]>(`/customers/${customerId}/endpoints`);
}

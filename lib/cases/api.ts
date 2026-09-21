import { ApiError } from "@/lib/api-error";
import { API_BASE_URL, USE_MOCK_CASES } from "@/lib/config";
import { clearAuth, getStoredToken } from "@/lib/auth/storage";
import { mockCaseEvents, mockCases } from "@/lib/cases/mock-data";
import type {
  AssignedAnalyst,
  Case,
  CaseEvent,
  CaseFilters,
  CaseVerdict,
} from "@/lib/cases/types";

const MOCK_LATENCY_MS = 400;

// In-memory copy so mock mutations (assign, status change, verdict) are
// visible for the rest of the session. Swapped out entirely once
// NEXT_PUBLIC_API_BASE_URL points at the real Case API.
const store = {
  cases: mockCases.map((c) => ({ ...c })),
  events: structuredClone(mockCaseEvents),
};

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_LATENCY_MS));
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
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

function applyFilters(cases: Case[], filters?: CaseFilters): Case[] {
  if (!filters) return cases;
  return cases.filter((c) => {
    if (filters.status && c.status !== filters.status) return false;
    if (filters.severityMin !== undefined && c.severity < filters.severityMin)
      return false;
    if (filters.severityMax !== undefined && c.severity > filters.severityMax)
      return false;
    if (filters.customerId && c.customer_id !== filters.customerId)
      return false;
    return true;
  });
}

function addEvent(caseId: string, event: Omit<CaseEvent, "id" | "case_id">) {
  const entry: CaseEvent = {
    id: `ev_${Math.random().toString(36).slice(2, 9)}`,
    case_id: caseId,
    ...event,
  };
  store.events[caseId] = [...(store.events[caseId] ?? []), entry];
  return entry;
}

export async function fetchCases(filters?: CaseFilters): Promise<Case[]> {
  if (USE_MOCK_CASES) {
    return delay(applyFilters(store.cases, filters));
  }
  const params = new URLSearchParams();
  if (filters?.status) params.set("status", filters.status);
  if (filters?.severityMin !== undefined)
    params.set("severity", String(filters.severityMin));
  const qs = params.toString();
  return request<Case[]>(`/cases${qs ? `?${qs}` : ""}`);
}

export async function fetchCase(id: string): Promise<Case> {
  if (USE_MOCK_CASES) {
    const found = store.cases.find((c) => c.id === id);
    if (!found) throw new ApiError("Case not found", 404);
    return delay({ ...found });
  }
  return request<Case>(`/cases/${id}`);
}

export async function fetchCaseEvents(id: string): Promise<CaseEvent[]> {
  if (USE_MOCK_CASES) {
    return delay(store.events[id] ?? []);
  }
  return request<CaseEvent[]>(`/cases/${id}/events`);
}

export async function updateCaseStatus(
  id: string,
  status: Case["status"]
): Promise<Case> {
  if (USE_MOCK_CASES) {
    const found = store.cases.find((c) => c.id === id);
    if (!found) throw new ApiError("Case not found", 404);
    const previousStatus = found.status;
    found.status = status;
    addEvent(id, {
      type: "status_change",
      message: `Status changed from ${previousStatus} to ${status}`,
      actor_name: "You",
      created_at: new Date().toISOString(),
    });
    return delay({ ...found });
  }
  return request<Case>(`/cases/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function submitVerdict(
  id: string,
  verdict: CaseVerdict
): Promise<Case> {
  if (USE_MOCK_CASES) {
    const found = store.cases.find((c) => c.id === id);
    if (!found) throw new ApiError("Case not found", 404);
    found.verdict = verdict;
    found.status = "resolved";
    addEvent(id, {
      type: "verdict",
      message: `Verdict submitted: ${verdict.classification}`,
      actor_name: "You",
      created_at: new Date().toISOString(),
    });
    return delay({ ...found });
  }
  return request<Case>(`/cases/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "resolved", verdict }),
  });
}

export async function assignCase(
  id: string,
  analyst: AssignedAnalyst
): Promise<Case> {
  if (USE_MOCK_CASES) {
    const found = store.cases.find((c) => c.id === id);
    if (!found) throw new ApiError("Case not found", 404);
    found.assigned_analyst = analyst;
    if (found.status === "new") found.status = "investigating";
    addEvent(id, {
      type: "assignment",
      message: `Case assigned to ${analyst.name}`,
      actor_name: analyst.name,
      created_at: new Date().toISOString(),
    });
    return delay({ ...found });
  }
  return request<Case>(`/cases/${id}/assign`, { method: "POST" });
}

export async function escalateCase(
  id: string,
  reason: string
): Promise<Case> {
  if (USE_MOCK_CASES) {
    const found = store.cases.find((c) => c.id === id);
    if (!found) throw new ApiError("Case not found", 404);
    found.status = "escalated";
    addEvent(id, {
      type: "escalation",
      message: reason,
      actor_name: "You",
      created_at: new Date().toISOString(),
    });
    return delay({ ...found });
  }
  return request<Case>(`/cases/${id}/escalate`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export async function addCaseNote(
  id: string,
  note: string
): Promise<CaseEvent> {
  if (USE_MOCK_CASES) {
    const found = store.cases.find((c) => c.id === id);
    if (!found) throw new ApiError("Case not found", 404);
    const event = addEvent(id, {
      type: "note",
      message: note,
      actor_name: "You",
      created_at: new Date().toISOString(),
    });
    return delay(event);
  }
  return request<CaseEvent>(`/cases/${id}/notes`, {
    method: "POST",
    body: JSON.stringify({ note }),
  });
}

export async function fetchCustomerCases(customerId: string): Promise<Case[]> {
  if (USE_MOCK_CASES) {
    return delay(store.cases.filter((c) => c.customer_id === customerId));
  }
  return request<Case[]>(`/customers/${customerId}/cases`);
}

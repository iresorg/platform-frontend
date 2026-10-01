import { toCase, toEvents } from "@/lib/cases/adapter";
import type { Case, CaseEvent } from "@/lib/cases/types";
import { fetchIncident, fetchIncidents } from "@/lib/incidents/api";

export interface CaseTenant {
  id: string;
  name: string;
}

// One page of up to 100 — a customer's whole history at MVP scale. A
// dedicated portal endpoint (see the handover) should replace this.
export async function fetchCustomerCases(tenant: CaseTenant): Promise<Case[]> {
  const page = await fetchIncidents({ page_size: 100 });
  return page.results.map((i) => toCase(i, tenant));
}

export async function fetchCase(id: string, tenant: CaseTenant): Promise<Case> {
  return toCase(await fetchIncident(id), tenant);
}

export async function fetchCaseEvents(id: string): Promise<CaseEvent[]> {
  return toEvents(await fetchIncident(id));
}

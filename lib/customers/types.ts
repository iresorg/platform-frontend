// /admin/customers/* — confirmed live against the schema 19 Oct 2026
// (the addendum's Screen 10). Field names below are exactly what the
// backend returns, not the addendum's prose — a few differ (branches_count
// not branch_count, invited_date not invited_at, etc.).

// GET /admin/customers row.
export interface AdminCustomerList {
  id: string;
  name: string;
  is_test: boolean;
  branches_count: number;
  endpoints_active: number;
  endpoints_total: number;
  open_cases: number;
}

// GET /admin/customers/:id. `contacts` is untyped on the backend (no
// declared shape in the schema) — render it defensively, not as a
// confirmed {technical_contact, escalation_contact} structure, until a
// real populated example is available.
export interface AdminCustomerDetail {
  id: string;
  name: string;
  sector: string;
  service_tier: string;
  is_test: boolean;
  contacts: unknown;
}

export interface AdminCustomerEndpoint {
  name: string;
  branch_label?: string;
  status: string;
  last_seen: string | null;
  os?: string;
}

export interface AdminCustomerOnboardingBranch {
  branch_label: string;
  expected_endpoints: number;
  enrolled: number;
  active: number;
}

export interface AdminCustomerOnboardingPending {
  agent_id: string;
  name: string;
  os_name?: string;
  date_add: string | null;
}

// GET /admin/customers/:id/onboarding, polled every 30s.
export interface AdminCustomerOnboarding {
  customer_id: string;
  customer_name: string;
  branches: AdminCustomerOnboardingBranch[];
  pending_endpoints: AdminCustomerOnboardingPending[];
}

export type AdminCustomerUserStatus = "invited" | "active" | "disabled";

export interface AdminCustomerUser {
  id: string;
  name: string;
  email: string;
  status: AdminCustomerUserStatus;
  invited_date: string | null;
}

export interface AdminCreateUserPayload {
  name: string;
  email: string;
}

// The invite link is shown once, same as a fleet enrolment token — the
// backend only ever returns it on this create call.
export interface AdminCreateUserResponse {
  id: string;
  name: string;
  email: string;
  status: string;
  invite_url: string;
  expires_at: string;
}

export interface DisableUserResponse {
  message: string;
  user_id: string;
  is_active: boolean;
}

// /admin/customers/* — from the 19 Oct 2026 addendum. Not yet confirmed
// live; shapes below are modeled exactly as the addendum describes them.
// Get a real example response from the backend engineer before this is
// treated as confirmed (see the Screens & Data Guide's own golden rule).

export interface Contact {
  name: string;
  phone: string;
  email: string;
}

// List row — GET /admin/customers.
export interface CustomerListItem {
  id: string;
  name: string;
  is_test: boolean;
  branch_count: number;
  endpoints_active: number;
  endpoints_total: number;
  open_cases: number;
}

export interface OnboardingBranch {
  branch_label: string;
  // Null/0 means "expected count unknown" — render the raw count with no
  // progress bar in that case, per the addendum.
  expected_count: number | null;
  active_count: number;
}

export interface EnrollingDevice {
  id: string;
  name: string;
  os: string;
  enrolled_at: string;
}

// GET /admin/customers/:id/onboarding, polled every 30s.
export interface OnboardingStatus {
  branches: OnboardingBranch[];
  enrolling: EnrollingDevice[];
}

export interface CustomerEndpoint {
  id: string;
  name: string;
  branch_label: string;
  // Raw Wazuh status — fine here, this is the analyst app.
  status: string;
  last_seen: string | null;
  os: string;
}

export type PortalUserStatus = "invited" | "active" | "disabled";

export interface CustomerPortalUser {
  id: string;
  name: string;
  email: string;
  status: PortalUserStatus;
  invited_at: string;
}

// GET /admin/customers/:id — Card 1 (Header) plus the technical/escalation
// contacts Card 3's workspace block and Card 4 here both need.
export interface CustomerDetail {
  id: string;
  name: string;
  sector: string;
  service_tier: string;
  is_test: boolean;
  technical_contact: Contact | null;
  escalation_contact: Contact | null;
}

export interface InviteCustomerUserPayload {
  name: string;
  email: string;
}

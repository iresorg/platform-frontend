// Internal iRES staff (GET/POST/PATCH /api/v1/admin/staff). Platform-wide,
// not tenant-scoped — so this works for an admin with no active tenant.

export type StaffTier = "tier1" | "tier2" | "admin";

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  tier: StaffTier;
  role: string;
  role_name: string;
  // e.g. "active" / "invited" / "disabled" — the spec leaves it a free string.
  status: string;
  is_active: boolean;
  created_at: string;
  invited_date?: string | null;
}

// Without a password the backend emails a 72-hour invite link; with one
// the account is active immediately.
export interface InviteStaffPayload {
  email: string;
  first_name?: string;
  last_name?: string;
  tier?: StaffTier;
  password?: string;
}

export interface InviteStaffResponse {
  id: string;
  email: string;
  name: string;
  tier: StaffTier;
  role: string;
  role_name: string;
  status: string;
  token?: string;
  invite_url?: string;
  expires_at?: string;
  invited_date?: string;
}

export interface UpdateStaffPayload {
  tier?: StaffTier;
  is_active?: boolean;
}

import { apiRequest } from "@/lib/http";
import type { LoginData } from "@/lib/auth/real-types";

// /auth/invite/* — confirmed live 19-20 Oct 2026 (the addendum's Screen
// 9). Public: no session required, unlike /invite/:token (lib/tenants —
// an existing, authenticated tenant-membership join with no password
// step). This is how a brand-new client user sets their very first
// password.

export interface InvitePreview {
  email: string;
  customer_name: string;
}

export interface AcceptInvitePayload {
  token: string;
  password: string;
}

// Throws ApiError with status 410 when the link is used or expired —
// the caller renders the expired state rather than treating this as a
// generic failure.
export async function getInvitePreview(token: string): Promise<InvitePreview> {
  return apiRequest<InvitePreview>(`/api/v1/auth/invite/${encodeURIComponent(token)}`);
}

// Returns the same { data: LoginResponseData } shape as /auth/login —
// confirmed live — not a bare JWT, despite the addendum's "returns a
// JWT" phrasing. Reuses LoginData so this stays in sync with the real
// login flow's shape rather than drifting from it.
export async function acceptInvite(payload: AcceptInvitePayload): Promise<LoginData> {
  const res = await apiRequest<{ data: LoginData }>("/api/v1/auth/invite/accept", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

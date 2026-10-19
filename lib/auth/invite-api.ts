import { apiRequest } from "@/lib/http";

// /auth/invite/* — from the 19 Oct 2026 addendum (Screen 9). Not yet
// confirmed live. Unlike /invite/:token (lib/tenants — an existing,
// authenticated tenant-membership join), this is public: no session
// required to preview or accept it, since it's how a brand-new client
// user sets their very first password.

export interface InvitePreview {
  email: string;
  customer_name: string;
}

export interface AcceptInvitePayload {
  token: string;
  password: string;
}

export interface AcceptInviteResponse {
  access_token: string;
}

// Throws ApiError with status 410 when the link is used or expired —
// the caller renders the expired state rather than treating this as a
// generic failure.
export async function getInvitePreview(token: string): Promise<InvitePreview> {
  return apiRequest<InvitePreview>(`/api/v1/auth/invite/${encodeURIComponent(token)}`);
}

export async function acceptInvite(payload: AcceptInvitePayload): Promise<AcceptInviteResponse> {
  return apiRequest<AcceptInviteResponse>("/api/v1/auth/invite/accept", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

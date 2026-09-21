// Types for the real backend's auth API (api/v1/auth/...). Every request
// body and response shape here is confirmed against real samples.
// Responses that carry data are wrapped in { data: ... }; message-only
// responses are flat.

export interface RealLoginRequest {
  email: string;
  password: string;
  device_name: string;
}

// Returned by both login and mfa/verify, wrapped in { data: ... } (the
// client unwraps it). When requires_mfa is true the token fields are
// presumably absent (an MFA-enabled login hasn't been observed), hence
// optional.
export interface LoginData {
  requires_mfa: boolean;
  mfa_challenge_token?: string;
  session_id?: string;
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  active_tenant?: { id: string; name: string; slug: string };
}

export interface MessageResponse {
  message: string;
}

// forgot-password also hands back the reset token inline (like register
// does with its verification token), so a flow can complete without a
// real inbox.
export interface PasswordForgotResponse extends MessageResponse {
  reset_token?: string;
}

// token/refresh returns only the rotated credentials — not user or tenant.
export interface TokenRefreshData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  session_id: string;
}

// CONFIRMED (flat, not enveloped).
export interface RegisterResponse {
  message: string;
  user_id: string;
  verification_token: string;
  tenant: { id: string; slug: string };
}

export interface MfaVerifyRequest {
  mfa_challenge_token: string;
  code: string;
}

export interface PasswordChangeRequest {
  old_password: string;
  new_password: string;
}

export interface PasswordForgotRequest {
  email: string;
}

export interface PasswordResetRequest {
  token: string;
  new_password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  organization_name: string;
}

export interface EmailVerifyRequest {
  token: string;
}

export interface TokenRefreshRequest {
  refresh_token: string;
}

export interface AuthSession {
  id: string;
  device_name: string;
  user_agent: string;
  ip_address: string | null;
  created_at: string;
  last_seen_at: string;
  expires_at: string;
  is_active: boolean;
}

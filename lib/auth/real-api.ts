import { apiRequest } from "@/lib/http";
import type {
  AuthSession,
  EmailVerifyRequest,
  MfaVerifyRequest,
  PasswordChangeRequest,
  PasswordForgotRequest,
  PasswordResetRequest,
  RealLoginRequest,
  LoginData,
  MfaConfirmData,
  MfaSetupData,
  MessageResponse,
  PasswordForgotResponse,
  TokenRefreshData,
  RegisterRequest,
  RegisterResponse,
  TokenRefreshRequest,
} from "@/lib/auth/real-types";

export async function realLogin(payload: RealLoginRequest): Promise<LoginData> {
  // credentials: "include" — the backend keeps an MFA challenge in a session
  // cookie set here and read back by mfa/verify, so the cookie has to
  // travel. (Browsers only send it when app and API share a site.)
  const res = await apiRequest<{ data: LoginData }>("/api/v1/auth/login", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function realLogout(): Promise<MessageResponse> {
  return apiRequest<MessageResponse>("/api/v1/auth/logout", { method: "POST" });
}

export async function realLogoutAll(): Promise<MessageResponse> {
  return apiRequest<MessageResponse>("/api/v1/auth/logout-all", { method: "POST" });
}

export async function verifyMfa(payload: MfaVerifyRequest): Promise<LoginData> {
  const res = await apiRequest<{ data: LoginData }>("/api/v1/auth/mfa/verify", {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function changePassword(
  payload: PasswordChangeRequest
): Promise<MessageResponse> {
  return apiRequest<MessageResponse>("/api/v1/auth/password/change", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function forgotPassword(
  payload: PasswordForgotRequest
): Promise<PasswordForgotResponse> {
  return apiRequest<PasswordForgotResponse>("/api/v1/auth/password/forgot", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function resetPassword(
  payload: PasswordResetRequest
): Promise<MessageResponse> {
  return apiRequest<MessageResponse>("/api/v1/auth/password/reset", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function register(payload: RegisterRequest): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function verifyEmail(payload: EmailVerifyRequest): Promise<MessageResponse> {
  return apiRequest<MessageResponse>("/api/v1/auth/email/verify", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function listSessions(): Promise<AuthSession[]> {
  const res = await apiRequest<{ data: AuthSession[] }>("/api/v1/auth/sessions");
  return res.data;
}

export async function deleteSession(sessionId: string): Promise<MessageResponse> {
  return apiRequest<MessageResponse>(`/api/v1/auth/sessions/${sessionId}`, {
    method: "DELETE",
  });
}

export async function refreshToken(
  payload: TokenRefreshRequest
): Promise<TokenRefreshData> {
  const res = await apiRequest<{ data: TokenRefreshData }>("/api/v1/auth/token/refresh", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}


export async function mfaSetup(): Promise<MfaSetupData> {
  const res = await apiRequest<{ data: MfaSetupData }>("/api/v1/mfa/setup", { method: "POST" });
  return res.data;
}

export async function mfaConfirm(otpCode: string): Promise<MfaConfirmData> {
  const res = await apiRequest<{ data: MfaConfirmData }>("/api/v1/mfa/confirm", {
    method: "POST",
    body: JSON.stringify({ otp_code: otpCode }),
  });
  return res.data;
}

export async function mfaDisable(password: string, otpCode: string): Promise<MessageResponse> {
  return apiRequest<MessageResponse>("/api/v1/mfa/disable", {
    method: "POST",
    body: JSON.stringify({ password, otp_code: otpCode }),
  });
}

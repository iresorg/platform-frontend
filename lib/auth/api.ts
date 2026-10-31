import { ApiError } from "@/lib/api-error";
import { USE_MOCK_AUTH } from "@/lib/config";
import { mockAccounts } from "@/lib/auth/mock-users";
import { realLogin, verifyMfa } from "@/lib/auth/real-api";
import type { LoginData } from "@/lib/auth/real-types";
import { getMe } from "@/lib/tenants/api";
import type { MeResponse } from "@/lib/tenants/types";
import { isUserRole, STAFF_ROLES, TENANT_ROLES } from "@/lib/auth/types";
import type { AuthUser, LoginCredentials, LoginResult, UserRole } from "@/lib/auth/types";

const MOCK_LATENCY_MS = 500;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), MOCK_LATENCY_MS));
}

function base64UrlEncode(value: unknown): string {
  return btoa(JSON.stringify(value)).replace(/=+$/, "");
}

// Structurally a JWT (header.payload.signature) so downstream code can
// treat it the same way it would a real one, but the "signature" is a
// placeholder — nothing here is cryptographically verified. Replace with
// a real token from the backend once NEXT_PUBLIC_API_BASE_URL is set.
function createMockToken(user: AuthUser): string {
  const header = base64UrlEncode({ alg: "none", typ: "JWT" });
  const payload = base64UrlEncode({
    sub: user.id,
    role: user.role,
    name: user.name,
    exp: Date.now() + 1000 * 60 * 60 * 8,
  });
  return `${header}.${payload}.mock`;
}

// Thrown when the password was right but the account has MFA on: the caller
// asks for a code and finishes with completeMfaLogin().
export class MfaRequiredError extends Error {
  challengeToken: string;
  constructor(challengeToken: string) {
    super("Enter the code from your authenticator app.");
    this.name = "MfaRequiredError";
    this.challengeToken = challengeToken;
  }
}

// tier decides for staff: it's their platform level, whereas role can
// reflect the tenant they're switched into. An account matching nothing is
// refused rather than guessed at, since every route guard and permission
// check keys off this value.
function resolveRole({ role, tier, user_type }: MeResponse): UserRole {
  const normalizedTier = tier?.trim().toLowerCase();
  const normalizedRole = role?.trim().toLowerCase();
  const isStaff = user_type === "staff" || Boolean(normalizedTier);
  const candidate = isStaff ? (normalizedTier ?? normalizedRole) : normalizedRole;
  if (isUserRole(candidate) && (isStaff ? STAFF_ROLES : TENANT_ROLES).includes(candidate)) {
    return candidate;
  }
  throw new ApiError(
    `This account's role (${role || "none"}) isn't recognized, so it can't be signed in. Contact an iRES administrator.`,
    403
  );
}

export function mapMe(me: MeResponse): AuthUser {
  const { user, active_tenant, permissions } = me;
  const name = `${user.first_name} ${user.last_name}`.trim() || user.email;
  return {
    id: user.id,
    name,
    email: user.email,
    role: resolveRole(me),
    customer_id: active_tenant?.id,
    tenant_name: active_tenant?.name,
    permissions,
  };
}

export async function login(
  credentials: LoginCredentials
): Promise<LoginResult> {
  if (USE_MOCK_AUTH) {
    const account = mockAccounts.find(
      (a) =>
        a.credentials.email.toLowerCase() ===
          credentials.email.toLowerCase() &&
        a.credentials.password === credentials.password
    );
    if (!account) {
      throw new ApiError("Invalid email or password.", 401);
    }
    return delay({ token: createMockToken(account.user), user: account.user });
  }

  const data = await realLogin({ ...credentials, device_name: "Web Client" });

  if (data.requires_mfa) {
    throw new MfaRequiredError(data.mfa_challenge_token ?? "");
  }
  return finishRealLogin(data);
}

// Second step of an MFA sign-in: the code is a TOTP code or a recovery code.
export async function completeMfaLogin(
  challengeToken: string,
  code: string
): Promise<LoginResult> {
  return finishRealLogin(await verifyMfa({ mfa_challenge_token: challengeToken, code: code.trim() }));
}

async function finishRealLogin(data: LoginData): Promise<LoginResult> {
  if (!data.access_token) {
    throw new ApiError("Login succeeded but the server returned no access token.", 500);
  }
  // Identity, tenant and permissions come from /me. The token has to be
  // passed explicitly — it isn't persisted until this function returns.
  const user = { ...mapMe(await getMe(data.access_token)), session_id: data.session_id };
  return { token: data.access_token, user };
}

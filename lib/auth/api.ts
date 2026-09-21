import { ApiError } from "@/lib/api-error";
import { USE_MOCK_AUTH } from "@/lib/config";
import { mockAccounts } from "@/lib/auth/mock-users";
import { deriveRole } from "@/lib/auth/roles";
import { realLogin } from "@/lib/auth/real-api";
import { getMe } from "@/lib/tenants/api";
import type { MeResponse } from "@/lib/tenants/types";
import type { AuthUser, LoginCredentials, LoginResult } from "@/lib/auth/types";

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

export function mapMe(me: MeResponse): AuthUser {
  const { user, active_tenant, permissions } = me;
  const name = `${user.first_name} ${user.last_name}`.trim() || user.email;
  return {
    id: user.id,
    name,
    email: user.email,
    role: deriveRole(permissions),
    customer_id: active_tenant.id,
    tenant_name: active_tenant.name,
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
    throw new ApiError(
      "This account requires MFA, which isn't supported by this login form yet.",
      401
    );
  }
  if (!data.access_token) {
    throw new ApiError("Login succeeded but the server returned no access token.", 500);
  }

  // Identity, tenant and permissions come from /me. The token has to be
  // passed explicitly — it isn't persisted until this function returns.
  const user = { ...mapMe(await getMe(data.access_token)), session_id: data.session_id };
  return { token: data.access_token, user };
}

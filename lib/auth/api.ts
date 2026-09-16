import { ApiError } from "@/lib/api-error";
import { API_BASE_URL, USE_MOCK_API } from "@/lib/config";
import { mockAccounts } from "@/lib/auth/mock-users";
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

export async function login(
  credentials: LoginCredentials
): Promise<LoginResult> {
  if (USE_MOCK_API) {
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

  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) {
    throw new ApiError(res.statusText || "Login failed", res.status);
  }
  return res.json() as Promise<LoginResult>;
}

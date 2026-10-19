import { ApiError } from "@/lib/api-error";
import { API_BASE_URL } from "@/lib/config";
import { clearAuth, getStoredToken } from "@/lib/auth/storage";

function apiUrl(path: string): string {
  const base = (API_BASE_URL ?? "").replace(/\/+$/, "");
  return `${base}${path}`;
}

// Single fetch wrapper for every real-backend module. The backend
// authenticates with `Authorization: Bearer <access_token>` (returned by
// POST /auth/login) — despite the `--cookie sessionid=` in its curl
// examples, it sets no cookie and rejects cookie-only requests.
//
// `token` overrides the stored one; needed right after login, before the
// token has been persisted.
export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
  token?: string
): Promise<T> {
  const authToken = token ?? getStoredToken();
  let res: Response;
  try {
    res = await fetch(apiUrl(path), {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError(
      "Couldn't reach the backend — check your connection, or that the server allows this origin (CORS).",
      0
    );
  }

  if (!res.ok) {
    let message = res.statusText || "Request failed";
    let code: string | undefined;
    try {
      const body = await res.json();
      if (typeof body?.error?.message === "string") message = body.error.message;
      else if (typeof body?.detail === "string") message = body.detail;
      if (typeof body?.error?.code === "string") code = body.error.code;
    } catch {
      // response wasn't JSON — fall back to statusText
    }

    // The backend answers a missing/invalid token with 403 NOT_AUTHENTICATED
    // (not 401). Only treat it as an expired session if we actually sent a
    // token — otherwise a failed login attempt would look like one.
    if (authToken && (res.status === 401 || code === "NOT_AUTHENTICATED")) {
      clearAuth();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("ires:unauthorized"));
      }
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

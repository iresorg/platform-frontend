"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { completeMfaLogin, login as loginRequest, mapMe } from "@/lib/auth/api";
import { realLogout } from "@/lib/auth/real-api";
import { clearAuth, getStoredToken, getStoredUser, storeAuth } from "@/lib/auth/storage";
import { getMe } from "@/lib/tenants/api";
import { USE_MOCK_AUTH } from "@/lib/config";
import { isUserRole } from "@/lib/auth/types";
import type { AuthUser, LoginCredentials } from "@/lib/auth/types";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  // Finishes a sign-in that stopped at the MFA prompt.
  completeMfa: (challengeToken: string, code: string) => Promise<AuthUser>;
  logout: () => void;
  // Re-reads /me and updates the stored user — call after anything that
  // changes the active tenant or the user's permissions. Pass `token` when
  // the caller already has a fresher one than what's in storage (e.g.
  // switch-tenant hands back a token scoped to the new tenant) — without
  // it, /me would read the stale stored token and report stale data.
  refreshSession: (token?: string) => Promise<AuthUser>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // One-time hydration-safe read of localStorage: server and first client
    // render must agree (both render signed-out), so this can only run
    // after mount, not during the render that useState would give us.
    const token = getStoredToken();
    const stored = getStoredUser();
    if (!token || !stored || !isUserRole(stored.role)) {
      // Also drops a leftover role cookie, which would otherwise have
      // proxy.ts send /login straight back to a guard that sends it to /login.
      clearAuth();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false);
      return;
    }
    // Re-writes the role cookie, which can have expired or disagree with
    // the stored user.
    storeAuth(token, stored);
    setUser(stored);
    setIsLoading(false);
    if (USE_MOCK_AUTH) return;

    // The stored copy is only what was true at sign-in; tier, tenant and
    // permissions can all have changed since. A failure keeps it: a dead
    // token already signs out through ires:unauthorized.
    getMe(token)
      .then((me) => {
        if (getStoredToken() !== token) return;
        const refreshed: AuthUser = { ...mapMe(me), session_id: stored.session_id };
        storeAuth(token, refreshed);
        setUser(refreshed);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleUnauthorized() {
      clearAuth();
      setUser(null);
      toast.error("Your session has expired. Please sign in again.");
      router.replace("/login");
    }
    window.addEventListener("ires:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("ires:unauthorized", handleUnauthorized);
  }, [router]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const { token, user: loggedInUser } = await loginRequest(credentials);
    storeAuth(token, loggedInUser);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const completeMfa = useCallback(async (challengeToken: string, code: string) => {
    const { token, user: loggedInUser } = await completeMfaLogin(challengeToken, code);
    storeAuth(token, loggedInUser);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(() => {
    if (!USE_MOCK_AUTH) {
      // Best-effort — the real session lives server-side in the sessionid
      // cookie, but we clear local state regardless of whether this call
      // actually reaches the backend (e.g. CORS).
      realLogout().catch(() => {});
    }
    clearAuth();
    setUser(null);
    router.replace("/login");
  }, [router]);

  const refreshSession = useCallback(async (token?: string) => {
    const me = await getMe(token);
    const current = getStoredUser();
    const refreshed: AuthUser = { ...mapMe(me), session_id: current?.session_id };
    const activeToken = token ?? getStoredToken();
    if (activeToken) storeAuth(activeToken, refreshed);
    setUser(refreshed);
    return refreshed;
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, completeMfa, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

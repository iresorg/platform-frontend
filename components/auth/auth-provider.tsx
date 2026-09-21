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
import { login as loginRequest, mapMe } from "@/lib/auth/api";
import { realLogout } from "@/lib/auth/real-api";
import { clearAuth, getStoredToken, getStoredUser, storeAuth } from "@/lib/auth/storage";
import { getMe } from "@/lib/tenants/api";
import { USE_MOCK_AUTH } from "@/lib/config";
import type { AuthUser, LoginCredentials } from "@/lib/auth/types";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  logout: () => void;
  // Re-reads /me and updates the stored user — call after anything that
  // changes the active tenant or the user's permissions.
  refreshSession: () => Promise<AuthUser>;
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(getStoredUser());
    setIsLoading(false);
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

  const refreshSession = useCallback(async () => {
    const me = await getMe();
    const current = getStoredUser();
    const refreshed: AuthUser = { ...mapMe(me), session_id: current?.session_id };
    const token = getStoredToken();
    if (token) storeAuth(token, refreshed);
    setUser(refreshed);
    return refreshed;
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

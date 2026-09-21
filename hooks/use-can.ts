"use client";

import { useCallback } from "react";
import { useAuth } from "@/components/auth/auth-provider";

// Permission codes come from GET /me for the active tenant. This only
// decides what to *show* — the backend enforces every action regardless.
export function useCan() {
  const { user } = useAuth();
  const permissions = user?.permissions;
  return useCallback(
    (code: string) => Boolean(permissions?.includes(code)),
    [permissions]
  );
}

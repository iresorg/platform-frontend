"use client";

import { useCallback } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { GUIDE_PERMISSION_KEYS, hasGuidePermission, type GuidePermissionKey } from "@/lib/auth/permissions";

// One gate for both permission systems this app has:
//  - a guide key ("case.resolve_tp"): derived from the user's role — see
//    lib/auth/permissions.ts and its derivation notice.
//  - a raw backend code ("members.view"): read straight from GET /me's
//    permissions[], same as before the target-build migration (Team and
//    Roles still use these; the backend has real per-action codes there).
// This only decides what to *show*. The backend enforces (or, for guide
// keys that have no real backend split yet, doesn't — see the notice).
// Whether to offer an action the backend gates on a raw code. An empty list
// is treated as unknown rather than denied: GET /me reports [] for an admin
// with no active tenant, and whether that changes after switching isn't
// confirmed. The backend still enforces either way.
export function useCanAct() {
  const { user } = useAuth();
  const permissions = user?.permissions;
  return useCallback(
    (code: string) => !permissions?.length || permissions.includes(code),
    [permissions]
  );
}

export function useCan() {
  const { user } = useAuth();
  const role = user?.role;
  const permissions = user?.permissions;
  return useCallback(
    (code: string) => {
      if (GUIDE_PERMISSION_KEYS.has(code)) {
        return hasGuidePermission(role, code as GuidePermissionKey);
      }
      return Boolean(permissions?.includes(code));
    },
    [role, permissions]
  );
}

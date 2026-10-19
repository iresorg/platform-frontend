"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { isStaffRole } from "@/lib/auth/types";
import { IS_PRODUCTION, isDemoTenant } from "@/lib/config";

// Whether mock/demo data is allowed to render as real on this screen. A
// "Demo data" banner next to a fake number isn't enough to stop a real
// client's IT manager from acting on it — see the Oct 14 review. Staff
// and a designated demo tenant still see mock data (useful for internal
// review and sales demos); every other tenant user in production gets a
// "coming soon" state instead once this is false.
export function useMockVisible(): boolean {
  const { user } = useAuth();
  if (!user) return true;
  if (isStaffRole(user.role)) return true;
  if (!IS_PRODUCTION) return true;
  return isDemoTenant(user.customer_id);
}

"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { AppLoadingScreen } from "@/components/shared/app-loading-screen";
import { useCan } from "@/hooks/use-can";
import { NO_ORGANIZATION_PATH, TENANTLESS_ADMIN_PREFIXES } from "@/lib/auth/roles";
import { USE_MOCK_AUTH } from "@/lib/config";

// Nearly every endpoint is scoped to the active tenant, so an account
// without one (GET /me active_tenant: null) has nothing to show on most
// screens. NO_ORGANIZATION_PATH lets it pick a tenant it belongs to, or
// sends an admin with none on to onboarding. Sits inside RequireRole, so
// the user is loaded.
export function RequireTenant({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const can = useCan();
  const router = useRouter();
  const pathname = usePathname();

  // Mock accounts carry no customer_id at all.
  const noTenant = !USE_MOCK_AUTH && Boolean(user) && !user?.customer_id;
  const allowedHere = can("customer.manage") && TENANTLESS_ADMIN_PREFIXES.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (noTenant && !allowedHere) router.replace(NO_ORGANIZATION_PATH);
  }, [noTenant, allowedHere, router]);

  if (noTenant && !allowedHere) return <AppLoadingScreen />;

  return <>{children}</>;
}

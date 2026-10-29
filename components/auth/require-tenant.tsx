"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { AppLoadingScreen } from "@/components/shared/app-loading-screen";
import { useCan } from "@/hooks/use-can";
import { NO_ORGANIZATION_PATH, ONBOARD_TENANT_PATH, TENANTLESS_ADMIN_PREFIXES } from "@/lib/auth/roles";
import { USE_MOCK_AUTH } from "@/lib/config";

// Nearly every endpoint is scoped to the active tenant, so an account
// without one (GET /me active_tenant: null) has nothing to show on most
// screens. Admins are sent to onboard a customer; everyone else to
// NO_ORGANIZATION_PATH. Sits inside RequireRole, so the user is loaded.
export function RequireTenant({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const can = useCan();
  const router = useRouter();
  const pathname = usePathname();

  // Mock accounts carry no customer_id at all.
  const noTenant = !USE_MOCK_AUTH && Boolean(user) && !user?.customer_id;
  const canOnboard = can("customer.manage");
  const allowedHere = canOnboard && TENANTLESS_ADMIN_PREFIXES.some((p) => pathname.startsWith(p));
  const target = canOnboard ? ONBOARD_TENANT_PATH : NO_ORGANIZATION_PATH;

  useEffect(() => {
    if (noTenant && !allowedHere) router.replace(target);
  }, [noTenant, allowedHere, target, router]);

  if (noTenant && !allowedHere) return <AppLoadingScreen />;

  return <>{children}</>;
}

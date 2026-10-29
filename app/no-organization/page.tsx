"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { AuthHeading, AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { AppLoadingScreen } from "@/components/shared/app-loading-screen";
import { useTenantSwitch } from "@/components/tenants/use-tenant-switch";
import { Button } from "@/components/ui/button";
import { roleHome } from "@/lib/auth/roles";
import { useMyTenantsQuery } from "@/lib/tenants/queries";

// Where RequireTenant sends an account with no active tenant that can't
// onboard one itself. If it does belong to tenants (just none active),
// it can pick one here; otherwise an iRES admin has to add it.
export default function NoOrganizationPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const { data: tenants, isLoading: tenantsLoading } = useMyTenantsQuery();
  const { switchTo, isSwitching } = useTenantSwitch();

  useEffect(() => {
    if (isLoading) return;
    if (!user) router.replace("/login");
    else if (user.customer_id) router.replace(roleHome(user.role));
  }, [isLoading, user, router]);

  if (isLoading || !user || user.customer_id) return <AppLoadingScreen />;

  async function pick(tenantId: string) {
    if (await switchTo(tenantId)) router.replace(roleHome(user!.role));
  }

  return (
    <AuthSplitLayout
      eyebrow="ORGANIZATION"
      headline="Almost there."
      description="Everything in iRES belongs to an organization, and your account isn't working in one yet."
    >
      {tenants && tenants.length > 0 ? (
        <>
          <AuthHeading eyebrow="ORGANIZATION" title="Choose an organization" subtitle="Pick one to continue." />
          <div className="flex flex-col gap-2">
            {tenants.map((t) => (
              <Button
                key={t.id}
                variant="outline"
                size="lg"
                disabled={isSwitching}
                className="h-12 justify-start rounded-xl"
                onClick={() => void pick(t.id)}
              >
                {t.name}
              </Button>
            ))}
          </div>
        </>
      ) : (
        <>
          <AuthHeading
            eyebrow="ORGANIZATION"
            title="No organization yet"
            subtitle="Your account isn't linked to an organization yet."
          />
          <p role="status" className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
            {tenantsLoading
              ? "Checking your organizations..."
              : `Ask an iRES administrator to add ${user.email} to your organization, then sign in again.`}
          </p>
        </>
      )}
      <Button variant="ghost" size="lg" className="h-12 rounded-xl" onClick={logout}>
        Sign out
      </Button>
    </AuthSplitLayout>
  );
}

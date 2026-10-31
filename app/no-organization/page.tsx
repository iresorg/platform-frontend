"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { AuthHeading, AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { AppLoadingScreen } from "@/components/shared/app-loading-screen";
import { useTenantSwitch } from "@/components/tenants/use-tenant-switch";
import { Button } from "@/components/ui/button";
import { useCan } from "@/hooks/use-can";
import { ONBOARD_TENANT_PATH, roleHome } from "@/lib/auth/roles";
import { useCustomersQuery } from "@/lib/customers/queries";
import { customerTenants, SYSTEM_TENANT_NAME, useMyTenantsQuery } from "@/lib/tenants/queries";

// Where RequireTenant sends an account with no active tenant. If it belongs
// to tenants (just none active), it picks one here. Otherwise an admin goes
// on to onboard the first customer, or is told it isn't a member of the ones
// that exist; anyone else needs an iRES admin to add them.
export default function NoOrganizationPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const can = useCan();
  const { data, isLoading: tenantsLoading } = useMyTenantsQuery();
  const { switchTo, isSwitching } = useTenantSwitch();
  const tenants = data && customerTenants(data);
  const canOnboard = can("customer.manage");
  const { data: customers, isLoading: customersLoading } = useCustomersQuery(canOnboard);
  const clients = customers?.filter((c) => c.name !== SYSTEM_TENANT_NAME);
  const goOnboard = canOnboard && tenants?.length === 0 && clients?.length === 0;

  useEffect(() => {
    if (isLoading) return;
    if (!user) router.replace("/login");
    else if (user.customer_id) router.replace(roleHome(user.role));
    else if (goOnboard) router.replace(ONBOARD_TENANT_PATH);
  }, [isLoading, user, goOnboard, router]);

  if (isLoading || !user || user.customer_id || goOnboard) return <AppLoadingScreen />;

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
            {tenantsLoading || customersLoading
              ? "Checking your organizations..."
              : canOnboard && clients?.length
                ? `${clients.length === 1 ? "A customer has" : `${clients.length} customers have`} been onboarded, but ${user.email} isn't a member of any yet, so their cases and alerts can't be opened. You can still view them under Customers.`
                : `Ask an iRES administrator to add ${user.email} to your organization, then sign in again.`}
          </p>
        </>
      )}
      {canOnboard && clients && clients.length > 0 && (
        <Button size="lg" className="h-12 rounded-xl" onClick={() => router.push("/customers")}>
          View customers
        </Button>
      )}
      {canOnboard && (
        <Button variant="outline" size="lg" className="h-12 rounded-xl" onClick={() => router.push(ONBOARD_TENANT_PATH)}>
          Onboard a new customer
        </Button>
      )}
      <Button variant="ghost" size="lg" className="h-12 rounded-xl" onClick={logout}>
        Sign out
      </Button>
    </AuthSplitLayout>
  );
}

"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { IncidentCard } from "@/components/portal/incident-card";
import { PortalSubnav } from "@/components/portal/portal-subnav";
import { Skeleton } from "@/components/ui/skeleton";
import { useCustomerCasesQuery } from "@/lib/cases/queries";

export default function PortalHistoryPage() {
  const { user } = useAuth();
  const customerId = user?.customer_id ?? "";
  const { data: cases, isLoading } = useCustomerCasesQuery(customerId);

  const sorted = [...(cases ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="flex flex-col gap-4">
      <PortalSubnav />

      <div>
        <h1 className="text-xl">Incident History</h1>
        <p className="text-sm text-muted-foreground">
          Every incident recorded on your account, newest first.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground" role="status">
          No security incidents recorded for your account.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((c) => (
            <IncidentCard key={c.id} caseData={c} />
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { AlertTriangle, ArrowUpCircle, Radio, ServerCog } from "lucide-react";
import { CasesByCustomerCard } from "@/components/dashboard/cases-by-customer-card";
import { EndpointStatusCard } from "@/components/dashboard/endpoint-status-card";
import { RecentDetectionsCard } from "@/components/dashboard/recent-detections-card";
import { ThreatLevelBanner } from "@/components/dashboard/threat-level-banner";
import { Skeleton } from "@/components/ui/skeleton";
import { getRiskTier } from "@/lib/cases/risk";
import { useCasesQuery } from "@/lib/cases/queries";
import { useEndpointsQuery } from "@/lib/endpoints/queries";

export default function SecurityOperationsOverviewPage() {
  const { data: cases, isLoading: casesLoading } = useCasesQuery();
  const { data: endpoints, isLoading: endpointsLoading } = useEndpointsQuery();

  const isLoading = casesLoading || endpointsLoading;
  const allCases = cases ?? [];
  const allEndpoints = endpoints ?? [];

  const active = allCases.filter((c) => c.status !== "resolved");
  const stats = [
    {
      label: "Total Alerts",
      value: allCases.length,
      icon: Radio,
      tint: "bg-brand-navy/10 text-brand-navy dark:bg-brand-navy/20 dark:text-[#8b8fe8]",
    },
    {
      label: "Critical Incidents",
      value: active.filter((c) => getRiskTier(c.risk_score) === "critical").length,
      icon: AlertTriangle,
      tint: "bg-destructive/10 text-destructive",
    },
    {
      label: "Escalation Queue",
      value: allCases.filter((c) => c.status === "escalated").length,
      icon: ArrowUpCircle,
      tint: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
    },
    {
      label: "Active Endpoints",
      value: allEndpoints.filter((e) => e.status !== "offline").length,
      icon: ServerCog,
      tint: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl">Security Operations</h1>
        <p className="text-sm text-muted-foreground">
          Org-wide view across every tenant&rsquo;s active alerts and endpoints.
        </p>
      </div>

      <ThreatLevelBanner cases={allCases} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tint }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-sm"
          >
            <div className={`flex size-11 shrink-0 items-center justify-center rounded-full ${tint}`}>
              <Icon className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl leading-none font-bold">{value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <RecentDetectionsCard cases={allCases} />
        <EndpointStatusCard endpoints={allEndpoints} />
      </div>

      <CasesByCustomerCard cases={allCases} />
    </div>
  );
}

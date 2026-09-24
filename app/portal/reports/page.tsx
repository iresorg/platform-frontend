"use client";

import { Suspense, useMemo } from "react";
import dynamic from "next/dynamic";
import { useQueries } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/auth-provider";
import { PortalSubnav } from "@/components/portal/portal-subnav";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchCaseEvents } from "@/lib/cases/api";
import { caseKeys, useCustomerCasesQuery } from "@/lib/cases/queries";
import type { CaseEvent } from "@/lib/cases/types";
import {
  computeOutcomeBreakdown,
  computeResolutionTimeTrend,
  computeVolumeOverTime,
  describeOutcomeInsight,
  describeResolutionInsight,
  describeVolumeInsight,
} from "@/lib/portal/reports";

// recharts is a real dependency to pull into the bundle, so this whole
// section is loaded on demand rather than shipped with every /portal visit.
const VolumeOverTimeChart = dynamic(
  () => import("@/components/portal/reports-charts").then((m) => m.VolumeOverTimeChart),
  { ssr: false, loading: () => <Skeleton className="h-72 w-full rounded-xl" /> }
);
const OutcomeBreakdownChart = dynamic(
  () => import("@/components/portal/reports-charts").then((m) => m.OutcomeBreakdownChart),
  { ssr: false, loading: () => <Skeleton className="h-72 w-full rounded-xl" /> }
);
const ResolutionTimeTrendChart = dynamic(
  () => import("@/components/portal/reports-charts").then((m) => m.ResolutionTimeTrendChart),
  { ssr: false, loading: () => <Skeleton className="h-72 w-full rounded-xl" /> }
);

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-1.5 text-3xl font-bold">{value}</p>
    </div>
  );
}

export default function PortalReportsPage() {
  const { user } = useAuth();
  const customerId = user?.customer_id ?? "";
  const { data: cases, isLoading } = useCustomerCasesQuery(customerId);

  const resolvedCases = useMemo(
    () => (cases ?? []).filter((c) => c.status === "resolved"),
    [cases]
  );

  const eventQueries = useQueries({
    queries: resolvedCases.map((c) => ({
      queryKey: caseKeys.events(c.id),
      queryFn: () => fetchCaseEvents(c.id),
      enabled: resolvedCases.length > 0,
    })),
  });

  // Cheap map over a small array — not worth memoizing, and doing so would
  // need an unstable dependency (the per-query data references).
  const eventsByCaseId: Record<string, CaseEvent[]> = {};
  resolvedCases.forEach((c, i) => {
    const events = eventQueries[i]?.data;
    if (events) eventsByCaseId[c.id] = events;
  });

  const all = useMemo(() => cases ?? [], [cases]);
  const total = all.length;
  const resolved = resolvedCases.length;
  const contained = all.filter((c) => c.verdict?.classification === "true_positive").length;
  const investigating = all.filter(
    (c) => c.status === "investigating" || c.status === "new"
  ).length;

  const volume = useMemo(() => computeVolumeOverTime(all), [all]);
  const outcome = useMemo(() => computeOutcomeBreakdown(all), [all]);
  // Not memoized: eventsByCaseId is a fresh object every render anyway.
  const resolutionTrend = computeResolutionTimeTrend(resolvedCases, eventsByCaseId);

  return (
    <div className="flex flex-col gap-4">
      <PortalSubnav />

      <div>
        <h1 className="text-xl">Reports</h1>
        <p className="text-sm text-muted-foreground">
          How your account&apos;s security activity looks over time.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile label="Total incidents" value={total} />
          <StatTile label="Resolved" value={resolved} />
          <StatTile label="Contained" value={contained} />
          <StatTile label="Investigating" value={investigating} />
        </div>
      )}

      {!isLoading && (
        <Suspense fallback={<Skeleton className="h-72 w-full rounded-xl" />}>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <VolumeOverTimeChart data={volume} insight={describeVolumeInsight(volume)} />
            <OutcomeBreakdownChart data={outcome} insight={describeOutcomeInsight(outcome)} />
            <div className="lg:col-span-2">
              <ResolutionTimeTrendChart
                data={resolutionTrend}
                insight={describeResolutionInsight(resolutionTrend)}
              />
            </div>
          </div>
        </Suspense>
      )}
    </div>
  );
}

"use client";

import { AlertTriangle, Clock, ShieldCheck, UserX } from "lucide-react";
import { VulnerabilityPostureCard } from "@/components/dashboard-live/vulnerability-posture-card";
import { ColorBadge } from "@/components/ui/color-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDashboardEndpointsQuery,
  useDashboardKpisQuery,
  useProtectionStatusQuery,
  useVulnerabilityPostureQuery,
} from "@/lib/dashboard/queries";

export default function LiveOverviewPage() {
  const { data: kpis, isLoading: kpisLoading, isError: kpisError, error: kpisErr } = useDashboardKpisQuery();
  const { data: protection } = useProtectionStatusQuery();
  const { data: posture, isLoading: postureLoading } = useVulnerabilityPostureQuery();
  const { data: endpoints, isLoading: endpointsLoading } = useDashboardEndpointsQuery();

  const stats = kpis
    ? [
        { label: "Unassigned Cases", value: kpis.unassigned_cases, icon: UserX, tint: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400" },
        { label: "Near SLA Breach", value: kpis.near_sla_breach, icon: Clock, tint: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400" },
        { label: "Critical", value: kpis.critical, icon: AlertTriangle, tint: "bg-destructive/10 text-destructive" },
        { label: "Open Total", value: kpis.open_total, icon: ShieldCheck, tint: "bg-brand-navy/10 text-brand-navy dark:bg-brand-navy/20 dark:text-[#8b8fe8]" },
      ]
    : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl">Live Overview</h1>
          <p className="text-sm text-muted-foreground">
            Real KPIs, protection status and vulnerability posture from the live backend.
          </p>
        </div>
        {protection && (
          <ColorBadge tone={protection.open_incident_count > 0 ? "amber" : "emerald"}>
            {protection.protection_status}
          </ColorBadge>
        )}
      </div>

      {kpisError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Couldn&rsquo;t load KPIs{kpisErr instanceof Error ? `: ${kpisErr.message}` : "."}
        </div>
      )}

      {kpisLoading ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map(({ label, value, icon: Icon, tint }) => (
            <div key={label} className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
              <div className={`flex size-11 shrink-0 items-center justify-center rounded-full ${tint}`}>
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-2xl leading-none font-bold">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
          {kpis && (
            <div className="col-span-2 flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-sm lg:col-span-4">
              <div>
                <p className="text-2xl leading-none font-bold">{kpis.quarantine_count}</p>
                <p className="mt-1 text-xs text-muted-foreground">Items in quarantine</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {postureLoading ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : posture ? (
          <VulnerabilityPostureCard posture={posture} />
        ) : null}

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-1 text-xs font-bold tracking-wide text-muted-foreground uppercase">
            Endpoint Coverage
          </h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Devices actively reporting, by organization.
          </p>
          {endpointsLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : endpoints && endpoints.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {endpoints.map((ep) => {
                const pct = ep.total > 0 ? Math.round((ep.active / ep.total) * 100) : 0;
                return (
                  <li key={ep.tenant_id} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Active endpoints</span>
                      <span className="font-medium tabular-nums">
                        {ep.active} / {ep.total}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No endpoints reporting yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, Clock, HardDrive, HelpCircle, Sparkles, UserX } from "lucide-react";
import { ChartsRow } from "@/components/queue/charts-row";
import { MockDataBanner } from "@/components/shared/mock-data-banner";
import { Skeleton } from "@/components/ui/skeleton";
import { useCan } from "@/hooks/use-can";
import { useMockAiDraftsQuery } from "@/lib/mocks/ai";
import { useMetricsOverviewQuery } from "@/lib/metrics/queries";

// A1 · SOC overview. Every number comes from /metrics/overview — never
// counted across a paginated /cases response. A tile click lands on the
// queue with the matching filter applied.
export default function OverviewPage() {
  const router = useRouter();
  const can = useCan();
  const { data: metrics, isLoading } = useMetricsOverviewQuery();
  const { data: pendingDrafts } = useMockAiDraftsQuery("pending_review");

  const tiles = [
    { key: "unassigned", label: "Unassigned (no analyst)", value: metrics?.unassigned, icon: UserX, tint: "bg-tone-blue-bg text-tone-blue-fg", href: "/cases?tile=unassigned" },
    { key: "nearsla", label: "Near SLA breach", value: metrics?.near_sla_breach, icon: Clock, tint: "bg-tone-amber-bg text-tone-amber-fg", href: "/cases?tile=nearsla" },
    { key: "critical", label: "Critical", value: metrics?.critical, icon: AlertTriangle, tint: "bg-tone-red-bg text-tone-red-fg", href: "/cases?severity=CRITICAL" },
    { key: "unmapped", label: "Unmapped (tenant unclear)", value: metrics?.no_customer, icon: HelpCircle, tint: "bg-tone-gray-bg text-tone-gray-fg", href: null },
    { key: "endpoints", label: "Endpoints active", value: metrics?.endpoints ? `${metrics.endpoints.active}/${metrics.endpoints.total}` : undefined, icon: HardDrive, tint: "bg-tone-green-bg text-tone-green-fg", href: "/fleet" },
  ];
  if (can("ai.review")) {
    tiles.push({ key: "ai", label: "AI drafts pending", value: pendingDrafts?.length, icon: Sparkles, tint: "bg-tone-blue-bg text-tone-blue-fg", href: "/ai-review" });
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl">SOC Overview</h1>
        <p className="text-sm text-muted-foreground">Where things stand right now, across every tenant.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          {tiles.map(({ key, label, value, icon: Icon, tint, href }) => {
            const body = (
              <>
                <div className={`flex size-11 shrink-0 items-center justify-center rounded-full ${tint}`}>
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-2xl leading-none font-bold tabular-nums">{value ?? "—"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{label}</p>
                </div>
              </>
            );
            return href ? (
              <button
                key={key}
                type="button"
                onClick={() => router.push(href)}
                className="flex cursor-pointer items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 text-left shadow-sm transition-colors hover:border-ocean/60"
              >
                {body}
              </button>
            ) : (
              <div key={key} className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
                {body}
              </div>
            );
          })}
        </div>
      )}

      {can("ai.review") && <MockDataBanner endpoint="metrics.overview.pending_ai_drafts" />}

      <ChartsRow />
    </div>
  );
}

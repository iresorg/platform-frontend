"use client";

import { AlertTriangle, Clock, HelpCircle, UserX } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { MetricsOverview } from "@/lib/metrics/types";
import { cn } from "cn";

export type TileFilter = "unassigned" | "nearsla" | "critical";

interface Tile {
  key: string;
  label: string;
  value: number | undefined;
  icon: React.ElementType;
  tint: string;
  filter?: TileFilter;
  hint?: string;
}

// The four numbers an analyst checks first. Each clickable tile applies
// its filter to the table below — the single highest-value interaction on
// the queue. "Unmapped" is informational: it points at ops, not security.
export function MetricsBar({
  metrics,
  loading,
  active,
  onSelect,
}: {
  metrics: MetricsOverview | undefined;
  loading: boolean;
  active: TileFilter | null;
  onSelect: (filter: TileFilter | null) => void;
}) {
  const tiles: Tile[] = [
    { key: "unassigned", label: "Unassigned", value: metrics?.unassigned, icon: UserX, tint: "bg-tone-blue-bg text-tone-blue-fg", filter: "unassigned" },
    { key: "nearsla", label: "Near SLA breach", value: metrics?.near_sla_breach, icon: Clock, tint: "bg-tone-amber-bg text-tone-amber-fg", filter: "nearsla", hint: "15 minutes or less remaining" },
    { key: "critical", label: "Critical", value: metrics?.critical, icon: AlertTriangle, tint: "bg-tone-red-bg text-tone-red-fg", filter: "critical" },
    {
      key: "unmapped",
      label: "Unmapped",
      value: metrics?.no_customer,
      icon: HelpCircle,
      tint: "bg-tone-gray-bg text-tone-gray-fg",
      hint: "No customer could be resolved. An agent's group is misconfigured — an ops fix, not a security event.",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tiles.map((t) => {
        const Icon = t.icon;
        const selected = t.filter !== undefined && active === t.filter;
        const body = (
          <>
            <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", t.tint)}>
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <span className="text-left">
              {loading ? <Skeleton className="h-7 w-10" /> : <span className="block text-2xl leading-none font-bold tabular-nums">{t.value ?? "—"}</span>}
              <span className="mt-1 block text-xs text-muted-foreground">{t.label}</span>
            </span>
          </>
        );
        const cls = cn(
          "flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm transition-colors",
          selected ? "border-ocean ring-2 ring-ocean/30" : "border-border",
          t.filter && "cursor-pointer hover:border-ocean/60"
        );
        const tile = t.filter ? (
          <button type="button" aria-pressed={selected} className={cls} onClick={() => onSelect(selected ? null : t.filter!)}>
            {body}
          </button>
        ) : (
          <div className={cls}>{body}</div>
        );
        return t.hint ? (
          <Tooltip key={t.key}>
            <TooltipTrigger asChild>{tile}</TooltipTrigger>
            <TooltipContent className="max-w-64">{t.hint}</TooltipContent>
          </Tooltip>
        ) : (
          <div key={t.key} className="contents">{tile}</div>
        );
      })}
    </div>
  );
}

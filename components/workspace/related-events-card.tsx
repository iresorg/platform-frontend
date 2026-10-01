"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { SeverityBadge } from "@/components/shared/severity-badge";
import { SkeletonCard } from "@/components/shared/skeletons";
import { ApiError } from "@/lib/api-error";
import { useIncidentTimelineQuery } from "@/lib/incidents/queries";
import type { TimelineScope } from "@/lib/incidents/types";
import { Activity } from "lucide-react";
import { cn } from "cn";

const WINDOWS = [15, 30, 60] as const;

function Toggle<T extends string | number>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
            value === o.value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// What else happened on that machine around the incident, including the
// below-threshold events the queue never shows. Loaded only when opened.
export function RelatedEventsCard({ caseId }: { caseId: string }) {
  const [open, setOpen] = useState(false);
  const [minutes, setMinutes] = useState<15 | 30 | 60>(15);
  const [scope, setScope] = useState<TimelineScope>("agent");
  const { data, isLoading, isError, error } = useIncidentTimelineQuery(caseId, { minutes, scope }, open);

  const noEventTime = error instanceof ApiError && /event time|NO_EVENT_TIME/i.test(error.message);

  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span>
          <span className="font-heading font-bold">Related events</span>
          <span className="ml-2 text-xs text-muted-foreground">Other activity around this case</span>
        </span>
        {open ? <ChevronUp className="size-4" aria-hidden="true" /> : <ChevronDown className="size-4" aria-hidden="true" />}
      </button>
      {open && (
        <div className="flex flex-col gap-3 border-t border-border p-5">
          <div className="flex flex-wrap items-center gap-3">
            <Toggle label="Time window" value={minutes} onChange={setMinutes} options={WINDOWS.map((m) => ({ value: m, label: `±${m} min` }))} />
            <Toggle<TimelineScope> label="Scope" value={scope} onChange={setScope} options={[{ value: "agent", label: "This endpoint" }, { value: "customer", label: "All endpoints" }]} />
          </div>
          {isLoading && <SkeletonCard className="h-24" />}
          {isError && (
            <p className="text-sm text-muted-foreground">
              {noEventTime
                ? "This case has no event time, so there's no moment to centre a timeline on."
                : `Couldn't load related events${error instanceof Error ? `: ${error.message}` : "."}`}
            </p>
          )}
          {data && data.results.length === 0 && (
            <EmptyState icon={Activity} title="Nothing else in this window" description="Try a wider window or all endpoints." />
          )}
          {data && data.results.length > 0 && (
            <ul className="flex flex-col divide-y divide-border">
              {data.results.map((e, i) => (
                <li key={`${e.timestamp}-${i}`} className="flex items-start gap-3 py-2.5">
                  <SeverityBadge level={e.rule_level} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{e.rule_description}</p>
                    <p className="text-xs text-muted-foreground">
                      <time dateTime={e.timestamp}>{new Date(e.timestamp).toLocaleTimeString()}</time> · {e.agent_name} · rule {e.rule_id}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}

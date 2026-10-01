"use client";

import { ArrowRightLeft, ArrowUpCircle, CheckCircle2, Eye, MessageSquare, PlusCircle, Repeat, ShieldCheck, UserCheck } from "lucide-react";
import { RelativeTime } from "@/components/shared/relative-time";
import { classifyNote, type TimelineKind } from "@/lib/incidents/enrichment";
import type { IncidentNote } from "@/lib/incidents/types";
import { cn } from "cn";

const KIND: Record<TimelineKind, { icon: React.ElementType; tone: string; label: string }> = {
  created: { icon: PlusCircle, tone: "bg-tone-blue-bg text-tone-blue-fg", label: "Created" },
  occurrence: { icon: Repeat, tone: "bg-tone-gray-bg text-tone-gray-fg", label: "Seen again" },
  enriched: { icon: ShieldCheck, tone: "bg-tone-blue-bg text-tone-blue-fg", label: "Enriched" },
  assigned: { icon: UserCheck, tone: "bg-tone-gray-bg text-tone-gray-fg", label: "Assigned" },
  note: { icon: MessageSquare, tone: "bg-tone-gray-bg text-tone-gray-fg", label: "Note" },
  status: { icon: ArrowRightLeft, tone: "bg-tone-amber-bg text-tone-amber-fg", label: "Status changed" },
  escalated: { icon: ArrowUpCircle, tone: "bg-tone-orange-bg text-tone-orange-fg", label: "Escalated" },
  resolved: { icon: CheckCircle2, tone: "bg-tone-green-bg text-tone-green-fg", label: "Resolved" },
  verdict: { icon: Eye, tone: "bg-tone-blue-bg text-tone-blue-fg", label: "Verdict" },
};

// The audit trail: newest first, complete, readable. Internal — this never
// reaches the customer portal.
export function CaseTimeline({ notes }: { notes: IncidentNote[] }) {
  const sorted = [...notes].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  if (sorted.length === 0) return <p className="text-sm text-muted-foreground">No activity yet.</p>;
  return (
    <ol className="flex flex-col gap-4">
      {sorted.map((n, i) => {
        const k = KIND[classifyNote(n)];
        const Icon = k.icon;
        return (
          <li key={n.id} className="relative flex gap-3">
            {i < sorted.length - 1 && <span className="absolute top-8 bottom-[-1rem] left-4 w-px -translate-x-1/2 bg-border" aria-hidden="true" />}
            <span className={cn("relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full", k.tone)}>
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-sm break-words whitespace-pre-wrap">{n.content}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {k.label} · <RelativeTime iso={n.created_at} /> · {n.author_email}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

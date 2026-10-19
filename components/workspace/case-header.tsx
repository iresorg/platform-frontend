"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { CopyButton } from "@/components/shared/copy-button";
import { IntelBadge } from "@/components/shared/intel-badge";
import { RelativeTime } from "@/components/shared/relative-time";
import { SeverityBadge } from "@/components/shared/severity-badge";
import { ArrowUpCircle } from "lucide-react";
import { SLABadge } from "@/components/shared/sla-badge";
import { StatusPill } from "@/components/shared/status-pill";
import { TestBadge } from "@/components/shared/test-badge";
import { classifyNote } from "@/lib/incidents/enrichment";
import type { Incident } from "@/lib/incidents/types";

export function CaseHeader({ incident }: { incident: Incident }) {
  const router = useRouter();
  const { user } = useAuth();
  const done = incident.status === "RESOLVED" || incident.status === "CLOSED";
  const text = incident.summary || incident.description;
  // The case object has no customer_id/customer_name of its own (even
  // after the 19-20 Oct addendum) — every case the analyst can see
  // belongs to their own active tenant, so that's the link target too.
  // is_escalated/escalated_at were added to the backend 2026-10-17 — not
  // yet confirmed live with a populated value (no staff account available
  // to check post-change; see the real tier/role rollout notes). Falls
  // back to reading it out of the timeline (the old approach) for any
  // case created before the field existed, or if it's ever absent.
  const escalationNote = [...incident.notes].reverse().find((n) => classifyNote(n) === "escalated");
  const isEscalated = incident.is_escalated ?? Boolean(escalationNote);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
      {/* history.back keeps whatever filters the analyst came from */}
      <button
        type="button"
        onClick={() => (window.history.length > 1 ? router.back() : router.push("/cases"))}
        className="flex w-fit cursor-pointer items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to queue
      </button>
      <div className="flex flex-wrap items-center gap-2">
        <SeverityBadge severity={incident.severity} />
        <StatusPill status={incident.status} />
        <IntelBadge score={incident.intel_score} />
        <SLABadge dueAt={incident.sla_due_at} done={done} />
        {incident.is_test && <TestBadge />}
      </div>
      <h1 className="font-heading text-xl font-bold">{incident.title}</h1>
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
        {user?.tenant_name && (
          <span>
            {user.customer_id ? (
              <Link href={`/customers/${user.customer_id}`} className="hover:text-foreground hover:underline">
                {user.tenant_name}
              </Link>
            ) : (
              user.tenant_name
            )}
            {incident.branch_label && <span className="text-muted-foreground"> · {incident.branch_label}</span>}
          </span>
        )}
        {incident.agent_name && (
          <>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 font-mono text-xs">
              {incident.agent_name}
              <CopyButton text={incident.agent_name} label="hostname" />
            </span>
          </>
        )}
        {(incident.occurrence_count ?? 0) > 1 && (
          <>
            <span aria-hidden="true">·</span>
            <span>seen ×{incident.occurrence_count}</span>
          </>
        )}
        <span aria-hidden="true">·</span>
        <span>first seen <RelativeTime iso={incident.created_at} /></span>
        <span aria-hidden="true">·</span>
        <span>{incident.assigned_to_email ? `assigned to ${incident.assigned_to_email}` : "unassigned"}</span>
      </p>
      {text && <p className="text-sm">{text}</p>}
      {isEscalated && (
        <p className="flex items-start gap-1.5 rounded-lg border border-tone-orange-line bg-tone-orange-bg px-3 py-2 text-sm text-tone-orange-fg">
          <ArrowUpCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>
            {escalationNote
              ? <>Escalated by {escalationNote.author_email}: {escalationNote.content.replace(/^Case escalated to \w+\.\s*/i, "")}</>
              : "Escalated for Tier 2 review."}
          </span>
        </p>
      )}
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { CopyButton } from "@/components/shared/copy-button";
import { IntelBadge } from "@/components/shared/intel-badge";
import { RelativeTime } from "@/components/shared/relative-time";
import { SeverityBadge } from "@/components/shared/severity-badge";
import { SLABadge } from "@/components/shared/sla-badge";
import { StatusPill } from "@/components/shared/status-pill";
import type { Incident } from "@/lib/incidents/types";

export function CaseHeader({ incident }: { incident: Incident }) {
  const router = useRouter();
  const { user } = useAuth();
  const done = incident.status === "RESOLVED" || incident.status === "CLOSED";
  const text = incident.summary || incident.description;

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
      </div>
      <h1 className="font-heading text-xl font-bold">{incident.title}</h1>
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
        {user?.tenant_name && <span>{user.tenant_name}</span>}
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
    </div>
  );
}

"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AlertStatusBadge } from "@/components/alerts/alert-status-badge";
import { EscalateDialog } from "@/components/alerts/escalate-dialog";
import { RuleLevelBadge } from "@/components/alerts/rule-level-badge";
import { TriagePanel } from "@/components/alerts/triage-panel";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlertQuery } from "@/lib/alerts/queries";

function formatDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5">
      <span className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

export default function LiveAlertDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: alert, isLoading, isError, error } = useAlertQuery(id);

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/cases/live-alerts"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to Live Alerts
      </Link>

      {isLoading && (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          Couldn&rsquo;t load this alert
          {error instanceof Error ? `: ${error.message}` : "."}
        </div>
      )}

      {alert && (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border bg-card p-5 shadow-sm">
            <div>
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <RuleLevelBadge level={alert.rule_level} />
                <AlertStatusBadge status={alert.status} />
              </div>
              <h1 className="font-heading text-xl font-bold">
                {alert.rule_description}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {alert.agent_name} ({alert.agent_ip}) · Detected{" "}
                {formatDateTime(alert.detected_at)}
              </p>
            </div>
            <EscalateDialog alertId={alert.id} defaultTitle={alert.rule_description} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="mb-1 font-heading font-bold">Alert Details</h2>
              <div className="divide-y divide-border">
                <DetailRow label="Rule ID" value={alert.rule_id} />
                <DetailRow label="Rule Groups" value={alert.rule_groups?.join(", ") || "—"} />
                <DetailRow label="External ID" value={alert.external_id} />
                <DetailRow label="Agent ID" value={alert.agent_id} />
                <DetailRow
                  label="Triage Notes"
                  value={alert.triage_notes || "Not yet triaged."}
                />
                <DetailRow
                  label="Triaged By"
                  value={alert.triaged_by_email || "—"}
                />
                <DetailRow label="Triaged At" value={formatDateTime(alert.triaged_at)} />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="mb-3 font-heading font-bold">Triage</h2>
              <TriagePanel alertId={alert.id} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

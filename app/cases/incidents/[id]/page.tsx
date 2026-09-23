"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { IncidentNotes } from "@/components/incidents/incident-notes";
import { IncidentSeverityBadge } from "@/components/incidents/incident-severity-badge";
import { IncidentStatusBadge } from "@/components/incidents/incident-status-badge";
import { StatusChangeForm } from "@/components/incidents/status-change-form";
import { Skeleton } from "@/components/ui/skeleton";
import { useIncidentQuery } from "@/lib/incidents/queries";

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

export default function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: incident, isLoading, isError, error } = useIncidentQuery(id);

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/cases/incidents"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to Incidents
      </Link>

      {isLoading && (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          Couldn&rsquo;t load this incident
          {error instanceof Error ? `: ${error.message}` : "."}
        </div>
      )}

      {incident && (
        <>
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <IncidentSeverityBadge severity={incident.severity} />
              <IncidentStatusBadge status={incident.status} />
            </div>
            <h1 className="font-heading text-xl font-bold">{incident.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {incident.agent_name} · Opened {formatDateTime(incident.created_at)}
            </p>
            <p className="mt-3 text-sm">{incident.description}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <h2 className="mb-1 font-heading font-bold">Details</h2>
                <div className="divide-y divide-border">
                  <DetailRow label="Source" value={incident.source_type} />
                  <DetailRow label="Agent ID" value={incident.agent_id} />
                  <DetailRow
                    label="Assigned To"
                    value={incident.assigned_to_email || "Unassigned"}
                  />
                  <DetailRow label="Related Alert" value={incident.related_alert || "—"} />
                  <DetailRow label="Resolved At" value={formatDateTime(incident.resolved_at)} />
                  <DetailRow
                    label="Resolution Summary"
                    value={incident.resolution_summary || "—"}
                  />
                </div>
              </div>

              {(incident.rule_id ||
                incident.intel_score !== undefined ||
                incident.sla_due_at ||
                incident.dedupe_key ||
                incident.opencti_enrichment) && (
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                  <h2 className="mb-1 font-heading font-bold">Enrichment</h2>
                  <p className="mb-1 text-xs text-muted-foreground">
                    From the Wazuh/OpenCTI pipeline, when available.
                  </p>
                  <div className="divide-y divide-border">
                    {incident.rule_id && <DetailRow label="Rule ID" value={incident.rule_id} />}
                    {incident.intel_score !== undefined && (
                      <DetailRow label="Intel Score" value={incident.intel_score} />
                    )}
                    {incident.occurrence_count !== undefined && (
                      <DetailRow label="Occurrences" value={incident.occurrence_count} />
                    )}
                    {incident.dedupe_key && (
                      <DetailRow label="Dedupe Key" value={incident.dedupe_key} />
                    )}
                    {incident.sla_due_at && (
                      <DetailRow label="SLA Due" value={formatDateTime(incident.sla_due_at)} />
                    )}
                    {incident.last_seen_at && (
                      <DetailRow label="Last Seen" value={formatDateTime(incident.last_seen_at)} />
                    )}
                    {incident.opencti_enrichment && (
                      <DetailRow label="OpenCTI" value={incident.opencti_enrichment} />
                    )}
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <h2 className="mb-3 font-heading font-bold">Update Status</h2>
                <StatusChangeForm incidentId={incident.id} currentStatus={incident.status} />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="mb-3 font-heading font-bold">Notes</h2>
              <IncidentNotes incidentId={incident.id} notes={incident.notes} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

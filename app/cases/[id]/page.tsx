"use client";

import { use } from "react";
import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { SkeletonCard } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import { ActionsCard } from "@/components/workspace/actions-card";
import { CaseHeader } from "@/components/workspace/case-header";
import { CaseTimeline } from "@/components/workspace/case-timeline";
import { DetectionCard } from "@/components/workspace/detection-card";
import { EndpointCard } from "@/components/workspace/endpoint-card";
import { IntelCard } from "@/components/workspace/intel-card";
import { RawEventCard } from "@/components/workspace/raw-event-card";
import { NoteComposer } from "@/components/workspace/note-composer";
import { RelatedEventsCard } from "@/components/workspace/related-events-card";
import { VerdictCard } from "@/components/workspace/verdict-card";
import type { JsonObject } from "@/lib/alerts/types";
import { ApiError } from "@/lib/api-error";
import { parseAlertRef, parseEnrichment } from "@/lib/incidents/enrichment";
import { useIncidentQuery } from "@/lib/incidents/queries";

export default function CaseWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: incident, isLoading, isError, error } = useIncidentQuery(id);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex flex-col gap-4">
          <SkeletonCard className="h-40" />
          <SkeletonCard className="h-48" />
          <SkeletonCard className="h-32" />
        </div>
        <div className="flex flex-col gap-4">
          <SkeletonCard className="h-40" />
          <SkeletonCard className="h-64" />
        </div>
      </div>
    );
  }

  if (isError || !incident) {
    const notFound = error instanceof ApiError && error.status === 404;
    return (
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <EmptyState
          icon={FileQuestion}
          title={notFound ? "Case not found" : "Couldn't load this case"}
          description={
            notFound
              ? "It may have been removed, or the link is wrong."
              : error instanceof Error
                ? error.message
                : "Something went wrong."
          }
          action={
            <Button asChild variant="outline">
              <Link href="/cases">Back to the queue</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const done = incident.status === "RESOLVED" || incident.status === "CLOSED";
  const intel = parseEnrichment(incident.opencti_enrichment);
  const ref = parseAlertRef(incident.raw_alert_ref);

  return (
    <div className="flex flex-col gap-4">
      <CaseHeader incident={incident} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-4">
          {intel && <IntelCard intel={intel} />}
          <DetectionCard ref_={ref} ruleId={incident.rule_id} />
          <RawEventCard
            caseId={incident.id}
            inlineDocument={incident.raw_document as JsonObject | null | undefined}
            fallback={
              typeof incident.raw_alert_ref === "object" && incident.raw_alert_ref !== null && !Array.isArray(incident.raw_alert_ref)
                ? (incident.raw_alert_ref as JsonObject)
                : null
            }
            multiple={(incident.occurrence_count ?? 1) > 1}
          />
          <EndpointCard
            name={ref.agentName ?? incident.agent_name}
            id={ref.agentId ?? incident.agent_id}
            ip={ref.agentIp}
            os={ref.os}
          />
          <RelatedEventsCard caseId={incident.id} />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <ActionsCard incident={incident} />
          {done && <VerdictCard incident={incident} />}
          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 font-heading font-bold">Timeline</h2>
            <CaseTimeline notes={incident.notes} />
          </section>
          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <NoteComposer caseId={incident.id} disabled={false} />
          </section>
        </div>
      </div>
    </div>
  );
}

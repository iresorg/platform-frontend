"use client";

import Link from "next/link";
import { ActionsPanel } from "@/components/cases/actions-panel";
import { SeverityBadge } from "@/components/cases/severity-badge";
import { SlaBadge } from "@/components/cases/sla-badge";
import { StatusBadge } from "@/components/cases/status-badge";
import { TelemetryPanel } from "@/components/cases/telemetry-panel";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNow } from "@/hooks/use-now";
import { useCaseQuery } from "@/lib/cases/queries";

function formatOpened(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function CaseWorkspace({ caseId }: { caseId: string }) {
  const now = useNow();
  const { data: caseData, isLoading, isError } = useCaseQuery(caseId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError || !caseData) {
    return (
      <div className="flex flex-col gap-4">
        <Button asChild variant="outline" size="sm" className="w-fit">
          <Link href="/cases">← Queue</Link>
        </Button>
        <p className="text-destructive">
          This case could not be found. It may have been removed.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href="/cases">← Queue</Link>
        </Button>
        <span className="font-mono text-xs text-muted-foreground">
          /cases/{caseData.id}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <SeverityBadge severity={caseData.severity} />
          <StatusBadge status={caseData.status} />
          {caseData.status !== "resolved" && (
            <SlaBadge slaDueAt={caseData.sla_due_at} now={now} />
          )}
        </div>
        <h1 className="text-2xl">{caseData.title}</h1>
        <p className="text-sm text-muted-foreground">
          {caseData.customer_name} · {caseData.customer_id} ·{" "}
          {caseData.source} · opened {formatOpened(caseData.created_at)} ·
          assigned to{" "}
          <span className="font-medium text-foreground">
            {caseData.assigned_analyst?.name ?? "Unassigned"}
          </span>
        </p>
      </div>

      {caseData.verdict && (
        <div className="rounded-lg border border-border bg-muted/60 p-3.5 text-sm">
          <p className="font-bold capitalize">
            Verdict: {caseData.verdict.classification.replace("_", " ")}
          </p>
          <p className="mt-1 text-muted-foreground">
            {caseData.verdict.notes}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_360px]">
        <TelemetryPanel caseData={caseData} />
        <ActionsPanel caseData={caseData} />
      </div>
    </div>
  );
}

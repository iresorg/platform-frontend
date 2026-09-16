"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { CaseTimeline } from "@/components/cases/case-timeline";
import { CustomerStatusBadge } from "@/components/portal/customer-status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCaseEventsQuery, useCaseQuery } from "@/lib/cases/queries";

function formatDetected(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CustomerAdviceViewPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: caseData, isLoading, isError } = useCaseQuery(params.id);
  const { data: events } = useCaseEventsQuery(params.id);

  const backLink = (
    <Button asChild variant="outline" size="sm" className="w-fit">
      <Link href="/portal">← All incidents</Link>
    </Button>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {backLink}
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const belongsToCustomer = caseData?.customer_id === user?.customer_id;

  if (isError || !caseData || !belongsToCustomer) {
    return (
      <div className="flex flex-col gap-4">
        {backLink}
        <p className="text-destructive">
          This incident could not be found on your account.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {backLink}

      <div className="flex flex-col gap-2">
        <CustomerStatusBadge status={caseData.status} />
        <h1 className="text-2xl">{caseData.title}</h1>
        <p className="text-sm text-muted-foreground">
          Detected {formatDetected(caseData.created_at)} · affects{" "}
          {caseData.raw_alert_ref.agent_name}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-2 text-xs font-bold tracking-wide text-muted-foreground uppercase">
          What happened
        </h2>
        <p className="text-sm leading-relaxed">{caseData.summary}</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-2 text-xs font-bold tracking-wide text-muted-foreground uppercase">
          What we need you to do
        </h2>
        {caseData.verdict ? (
          <p className="text-sm leading-relaxed">
            {caseData.verdict.customer_guidance}
          </p>
        ) : (
          <p className="text-sm leading-relaxed text-muted-foreground">
            No action is required from your team yet. Our analysts are still
            reviewing this incident and will publish guidance here when the
            case is closed.
          </p>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-3 text-xs font-bold tracking-wide text-muted-foreground uppercase">
          Incident Timeline
        </h2>
        <CaseTimeline events={events ?? []} showActor={false} />
      </div>
    </div>
  );
}

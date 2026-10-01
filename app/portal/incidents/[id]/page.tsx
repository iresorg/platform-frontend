"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, FileQuestion } from "lucide-react";
import { toast } from "sonner";
import { CustomerTimeline } from "@/components/portal/customer-timeline";
import { EmptyState } from "@/components/shared/empty-state";
import { SkeletonCard } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import { ColorBadge } from "@/components/ui/color-badge";
import { CUSTOMER_STATUS_LABEL, CUSTOMER_STATUS_TONE, isPortalCaseDone } from "@/lib/portal/format";
import { useAcknowledgeCaseMutation, usePortalCaseQuery } from "@/lib/portal/queries";
import type { PortalTimelineEntry } from "@/lib/portal/types";

function formatDetected(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

function Section({ title, children, emphasis = false }: { title: string; children: React.ReactNode; emphasis?: boolean }) {
  return (
    <section
      className={
        emphasis
          ? "rounded-xl border-2 border-ocean/50 bg-tone-blue-bg/30 p-6 shadow-sm"
          : "rounded-xl border border-border bg-card p-5 shadow-sm"
      }
    >
      <h2 className="mb-2 text-xs font-bold tracking-wide text-muted-foreground uppercase">{title}</h2>
      {children}
    </section>
  );
}

export default function CustomerAdviceViewPage() {
  const params = useParams<{ id: string }>();
  const { data: caseData, isLoading, isError } = usePortalCaseQuery(params.id);
  const acknowledge = useAcknowledgeCaseMutation();
  const [justAcknowledged, setJustAcknowledged] = useState(false);

  const back = (
    <Button asChild variant="outline" size="sm" className="w-fit">
      <Link href="/portal/incidents">
        <ArrowLeft aria-hidden="true" />
        All incidents
      </Link>
    </Button>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {back}
        <SkeletonCard className="h-24" />
        <SkeletonCard className="h-40" />
      </div>
    );
  }

  if (isError || !caseData) {
    return (
      <div className="flex flex-col gap-4">
        {back}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <EmptyState icon={FileQuestion} title="We couldn't find that incident" description="It may not be on your account, or the link may be wrong." />
        </div>
      </div>
    );
  }

  const resolved = isPortalCaseDone(caseData.status);
  const guidance = caseData.customer_guidance.trim();
  const acknowledged = Boolean(caseData.acknowledged_at) || justAcknowledged;

  const steps: PortalTimelineEntry[] = [
    { message: "We detected this activity.", created_at: caseData.created_at },
    ...caseData.timeline,
  ];
  if (caseData.resolved_at) {
    steps.push({ message: "Resolved, and guidance was published.", created_at: caseData.resolved_at });
  }

  async function onAcknowledge() {
    try {
      await acknowledge.mutateAsync(caseData!.id);
      setJustAcknowledged(true);
      toast.success("Thanks — we've logged that you acted on this.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't record that. Try again.");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {back}

      <header className="flex flex-col gap-2">
        <ColorBadge tone={CUSTOMER_STATUS_TONE[caseData.status]} variant="outline">
          {CUSTOMER_STATUS_LABEL[caseData.status]}
        </ColorBadge>
        <h1 className="text-2xl">{caseData.summary || caseData.title}</h1>
        <p className="text-sm text-muted-foreground">Detected {formatDetected(caseData.created_at)}</p>
      </header>

      {/* The analyst's guidance is the entire point of this screen, so it
          leads and carries the most visual weight. */}
      <Section title="What we need you to do" emphasis>
        {resolved && guidance ? (
          <div className="flex flex-col gap-4">
            <p className="text-base leading-relaxed whitespace-pre-wrap">{guidance}</p>
            <div>
              <Button
                size="sm"
                variant={acknowledged ? "outline" : "default"}
                disabled={acknowledged || acknowledge.isPending}
                onClick={onAcknowledge}
              >
                {acknowledged ? (
                  <>
                    <CheckCircle2 aria-hidden="true" />
                    Done
                  </>
                ) : acknowledge.isPending ? (
                  "Saving..."
                ) : (
                  "We've done this"
                )}
              </Button>
            </div>
          </div>
        ) : resolved ? (
          <p className="text-sm leading-relaxed text-muted-foreground">This incident has been resolved. No action is needed from your team.</p>
        ) : (
          <p className="text-sm leading-relaxed text-muted-foreground">Our analysts are reviewing this and will update you here.</p>
        )}
      </Section>

      <Section title="What happened">
        <p className="text-sm leading-relaxed">{caseData.summary || caseData.title}</p>
      </Section>

      <Section title="Timeline">
        <CustomerTimeline entries={steps} />
      </Section>
    </div>
  );
}

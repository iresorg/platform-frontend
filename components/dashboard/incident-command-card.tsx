import Link from "next/link";
import { CaseTimeline } from "@/components/cases/case-timeline";
import { RiskBadge } from "@/components/cases/risk-badge";
import { Button } from "@/components/ui/button";
import { getRiskTier } from "@/lib/cases/risk";
import { useCaseEventsQuery } from "@/lib/cases/queries";
import type { Case } from "@/lib/cases/types";

function businessImpactLine(caseData: Case): string {
  const tier = getRiskTier(caseData.risk_score);
  if (tier === "critical") {
    return `High potential impact to ${caseData.customer_name}'s operations — treat as a major incident until contained.`;
  }
  return `Moderate potential impact to ${caseData.customer_name} — monitor for escalation.`;
}

export function IncidentCommandCard({ caseData }: { caseData: Case }) {
  const { data: events } = useCaseEventsQuery(caseData.id);
  const recentEvents = [...(events ?? [])]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <RiskBadge riskScore={caseData.risk_score} />
            <span className="text-xs text-muted-foreground">
              {caseData.customer_name}
            </span>
          </div>
          <h3 className="font-heading text-lg font-bold">{caseData.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {businessImpactLine(caseData)}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/cases/${caseData.id}`}>Open case</Link>
        </Button>
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <p className="mb-2 text-xs font-bold tracking-wide text-muted-foreground uppercase">
          Decision Log
        </p>
        {recentEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
        ) : (
          <CaseTimeline events={recentEvents} />
        )}
      </div>
    </div>
  );
}

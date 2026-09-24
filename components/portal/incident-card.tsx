import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CustomerStatusBadge } from "@/components/portal/customer-status-badge";
import { describeEvidence, describeOwnership } from "@/lib/portal/customer-view";
import type { Case } from "@/lib/cases/types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function IncidentCard({ caseData }: { caseData: Case }) {
  return (
    <Link
      href={`/portal/cases/${caseData.id}`}
      className="group flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/40"
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <CustomerStatusBadge status={caseData.status} />
          <span className="text-xs text-muted-foreground">
            {formatDate(caseData.created_at)}
          </span>
        </div>
        <p className="text-sm font-medium">{describeEvidence(caseData)}</p>
        <p className="text-xs text-muted-foreground">
          {describeOwnership(caseData)}
        </p>
      </div>
      <ChevronRight
        className="mt-1 size-4 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-foreground"
        aria-hidden="true"
      />
    </Link>
  );
}

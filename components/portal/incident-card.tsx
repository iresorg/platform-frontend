import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ColorBadge } from "@/components/ui/color-badge";
import { CUSTOMER_STATUS_LABEL, CUSTOMER_STATUS_TONE } from "@/lib/portal/format";
import type { PortalCaseListItem } from "@/lib/portal/types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function IncidentCard({ caseData }: { caseData: PortalCaseListItem }) {
  return (
    <Link
      href={`/portal/incidents/${caseData.id}`}
      className="group flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/40"
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <ColorBadge tone={CUSTOMER_STATUS_TONE[caseData.status]} variant="outline">
            {CUSTOMER_STATUS_LABEL[caseData.status]}
          </ColorBadge>
          <span className="text-xs text-muted-foreground">
            {formatDate(caseData.created_at)}
          </span>
        </div>
        <p className="text-sm font-medium">{caseData.summary || caseData.title}</p>
      </div>
      <ChevronRight
        className="mt-1 size-4 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-foreground"
        aria-hidden="true"
      />
    </Link>
  );
}

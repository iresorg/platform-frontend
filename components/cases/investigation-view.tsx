import Link from "next/link";
import { Laptop } from "lucide-react";
import { StatusBadge } from "@/components/cases/status-badge";
import { findCorrelatedCases } from "@/lib/cases/correlation";
import type { Case } from "@/lib/cases/types";

export function InvestigationView({
  caseData,
  allCases,
}: {
  caseData: Case;
  allCases: Case[];
}) {
  const correlated = findCorrelatedCases(caseData, allCases);
  const sameAssetCount = allCases.filter(
    (c) =>
      c.raw_alert_ref.agent_id === caseData.raw_alert_ref.agent_id &&
      c.id !== caseData.id
  ).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h3 className="mb-3 text-xs font-bold tracking-wide text-muted-foreground uppercase">
          Affected Asset
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
            <Laptop className="size-4" aria-hidden="true" />
          </div>
          <div>
            <p className="font-medium">{caseData.raw_alert_ref.agent_name}</p>
            <p className="text-xs text-muted-foreground">
              agent {caseData.raw_alert_ref.agent_id} ·{" "}
              {sameAssetCount === 0
                ? "no other cases on this asset"
                : `${sameAssetCount} other case${sameAssetCount === 1 ? "" : "s"} on this asset`}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h3 className="mb-1 text-xs font-bold tracking-wide text-muted-foreground uppercase">
          Correlated Cases
        </h3>
        <p className="mb-3 text-sm text-muted-foreground">
          Other cases sharing an asset, threat-intel match, or indicator with
          this one.
        </p>

        {correlated.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No correlated activity found across other cases.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {correlated.map(({ case: c, reasons }) => (
              <li key={c.id}>
                <Link
                  href={`/cases/${c.id}`}
                  className="flex flex-col gap-1 rounded-lg border border-border bg-muted/40 p-3 transition-colors hover:bg-muted/70"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{c.title}</p>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {c.customer_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {reasons.join(" · ")}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

import { Eye } from "lucide-react";
import { ColorBadge } from "@/components/ui/color-badge";
import type { CaseVerdict, Incident } from "@/lib/incidents/types";

const VERDICT_LABEL: Record<CaseVerdict, string> = {
  TRUE_POSITIVE: "True positive",
  FALSE_POSITIVE: "False positive",
  BENIGN: "Benign",
};

// A resolved case shows its verdict read-only: exactly what the customer
// was told. Falls back to resolution_summary for older cases resolved
// before customer_guidance existed as its own field.
export function VerdictCard({ incident }: { incident: Incident }) {
  const guidance = incident.customer_guidance || incident.resolution_summary;
  if (!guidance) return null;
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-heading font-bold">
          <Eye className="size-4 text-ocean" aria-hidden="true" />
          Guidance sent to the customer
        </h2>
        {incident.verdict && (
          <ColorBadge tone={incident.verdict === "TRUE_POSITIVE" ? "red" : "slate"}>
            {VERDICT_LABEL[incident.verdict]}
          </ColorBadge>
        )}
      </div>
      <p className="mt-2 text-sm whitespace-pre-wrap">{guidance}</p>
      {incident.resolved_at && (
        <p className="mt-2 text-xs text-muted-foreground">
          Resolved {new Date(incident.resolved_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
        </p>
      )}
    </section>
  );
}

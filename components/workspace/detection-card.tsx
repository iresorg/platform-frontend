import { Chips } from "@/components/alerts/chips";
import { LogBlock } from "@/components/workspace/log-block";
import type { ParsedAlertRef } from "@/lib/incidents/enrichment";

// Everything here is evidence taken from the original detection. If the
// case carries none of it (a manual case, say), the card isn't drawn.
export function DetectionCard({ ref_, ruleId }: { ref_: ParsedAlertRef; ruleId?: string }) {
  const rule = ref_.ruleId ?? ruleId;
  if (!rule && !ref_.ruleDescription && ref_.mitre.length === 0 && !ref_.fullLog) return null;
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="font-heading font-bold">Detection</h2>
      <div className="mt-3 flex flex-col gap-4">
        {(rule || ref_.ruleDescription) && (
          <p className="text-sm">
            {rule && <span className="font-mono text-xs">Rule {rule}</span>}
            {rule && ref_.ruleDescription && " · "}
            {ref_.ruleDescription}
          </p>
        )}
        {ref_.mitre.map((m) => (
          <div key={m.label} className="flex flex-col gap-1.5">
            <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">MITRE {m.label}</p>
            <Chips items={m.values} />
          </div>
        ))}
        {ref_.fullLog && <LogBlock text={ref_.fullLog} />}
      </div>
    </section>
  );
}

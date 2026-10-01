import { ShieldAlert } from "lucide-react";
import { ConfidenceMeter } from "@/components/shared/confidence-meter";
import { CopyButton } from "@/components/shared/copy-button";
import { iocTypeLabel, matchVerdict, type ParsedEnrichment } from "@/lib/incidents/enrichment";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
      <dt className="w-24 shrink-0 text-xs font-bold tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="min-w-0 flex-1 text-sm">{children}</dd>
    </div>
  );
}

// Rendered only for genuinely enriched cases, and visually set apart: it's
// the highest-signal thing on the page. Family and actor rows vanish when
// the feeds didn't supply them — never an empty label, never "null".
export function IntelCard({ intel }: { intel: ParsedEnrichment }) {
  const type = iocTypeLabel(intel.iocType);
  return (
    <section className="rounded-xl border-2 border-ocean/50 bg-tone-blue-bg/30 p-5 shadow-sm">
      <h2 className="flex items-center gap-2 font-heading font-bold">
        <ShieldAlert className="size-5 text-ocean" aria-hidden="true" />
        Threat intelligence
      </h2>
      <p className="mt-1 text-sm font-medium">{matchVerdict(intel.matchType)}</p>
      <dl className="mt-4 flex flex-col gap-3">
        {intel.confidence !== undefined && (
          <Row label="Confidence"><ConfidenceMeter value={intel.confidence} /></Row>
        )}
        {intel.indicators.length > 0 && (
          <Row label="Indicators">
            <ul className="flex flex-wrap gap-2">
              {intel.indicators.map((ioc) => (
                <li key={ioc} className="inline-flex items-center gap-1 rounded-md border border-border bg-card py-0.5 pr-0.5 pl-2 font-mono text-xs">
                  {ioc}
                  <CopyButton text={ioc} label="indicator" />
                </li>
              ))}
            </ul>
          </Row>
        )}
        {type && <Row label="Type">{type}</Row>}
        {intel.source && <Row label="Source">via {intel.source}</Row>}
        {intel.description && <Row label="Context">{intel.description}</Row>}
        {intel.malwareFamily && <Row label="Malware">{intel.malwareFamily}</Row>}
        {intel.threatActor && <Row label="Actor">{intel.threatActor}</Row>}
      </dl>
    </section>
  );
}

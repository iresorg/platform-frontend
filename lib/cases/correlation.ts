import type { Case } from "@/lib/cases/types";

export interface CorrelatedCase {
  case: Case;
  reasons: string[];
}

/**
 * L2-investigation-style correlation: surfaces other cases that share a
 * signal with the one being investigated — same asset, same threat intel
 * match, or an overlapping indicator — so an investigator doesn't have to
 * go hunting for related activity by hand.
 */
export function findCorrelatedCases(
  current: Case,
  allCases: Case[]
): CorrelatedCase[] {
  const currentIndicators = new Set(
    current.opencti_enrichment?.indicators ?? []
  );

  const correlated: CorrelatedCase[] = [];

  for (const candidate of allCases) {
    if (candidate.id === current.id) continue;
    const reasons: string[] = [];

    if (candidate.raw_alert_ref.agent_id === current.raw_alert_ref.agent_id) {
      reasons.push(`Same asset (${current.raw_alert_ref.agent_name})`);
    }

    if (
      current.opencti_enrichment?.malware_family &&
      candidate.opencti_enrichment?.malware_family ===
        current.opencti_enrichment.malware_family
    ) {
      reasons.push(
        `Same malware family: ${current.opencti_enrichment.malware_family}`
      );
    }

    if (
      current.opencti_enrichment?.threat_actor &&
      candidate.opencti_enrichment?.threat_actor ===
        current.opencti_enrichment.threat_actor
    ) {
      reasons.push(
        `Same threat actor: ${current.opencti_enrichment.threat_actor}`
      );
    }

    const sharedIndicator = candidate.opencti_enrichment?.indicators?.find(
      (indicator) => currentIndicators.has(indicator)
    );
    if (sharedIndicator) {
      reasons.push(`Shared indicator: ${sharedIndicator}`);
    }

    if (reasons.length > 0) {
      correlated.push({ case: candidate, reasons });
    }
  }

  return correlated;
}

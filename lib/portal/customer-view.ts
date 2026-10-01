// Still used by the three portal pages (Alerts, Recommendations, Reports)
// that were built as extras beyond the guide's four core screens and still
// run on the older /incidents-derived Case adapter — see lib/cases/*.
// The four core screens (Overview, Incidents, Incident detail, Devices)
// were rewritten against the real /portal/* endpoints, which now do this
// sanitization server-side; see lib/portal/format.ts for those.

import type { BadgeTone } from "@/components/ui/color-badge";
import type { CaseStatus } from "@/lib/cases/types";

export const CUSTOMER_STATUS_LABEL: Record<CaseStatus, string> = {
  new: "Under Review",
  investigating: "Under Review",
  escalated: "Priority Review",
  resolved: "Resolved",
};

export const CUSTOMER_STATUS_TONE: Record<CaseStatus, BadgeTone> = {
  new: "blue",
  investigating: "blue",
  escalated: "amber",
  resolved: "emerald",
};

// What a customer reads about an incident. Machine-generated case types
// have a known, plain sentence. Everything else uses the case's
// `summary`; if it's empty, falls back to a severity-aware line. The
// technical title and description are never used here.

const SOURCE_DESCRIPTIONS: Record<string, string> = {
  ENDPOINT_VISIBILITY_DROP:
    "One of your protected devices stopped reporting to our monitoring, so we are checking it is still safe.",
  VULNERABILITY:
    "A weakness was found on one of your systems that could be used to attack it.",
};

// Severity is the internal 0-15 scale — used only to pick a fallback
// sentence, never rendered as a number.
function genericEvidenceFallback(severity: number): string {
  if (severity >= 13) {
    return "A high-priority security event was detected and is under active review.";
  }
  if (severity >= 7) {
    return "A security event was detected and is being reviewed by your SOC team.";
  }
  return "A routine security event was detected and reviewed by your SOC team.";
}

export function describeEvidence(
  caseData: { source: string; summary: string; severity: number }
): string {
  return (
    SOURCE_DESCRIPTIONS[caseData.source] ??
    (caseData.summary.trim() || genericEvidenceFallback(caseData.severity))
  );
}

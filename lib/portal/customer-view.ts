// Centralized translation layer: internal Case/Incident data -> customer-safe
// output. Nothing that imports from here should need to re-derive any of
// this per component. Anything NOT exported here (risk_score, sla_due_at,
// rule_id, raw_alert_ref, assigned_analyst.name, verdict.classification,
// event.actor_name) must never be passed to a customer-facing component —
// that's the boundary this file exists to enforce in one place.

import type { BadgeTone } from "@/components/ui/color-badge";
import { getRiskTier } from "@/lib/cases/risk";
import type { Case, CaseEvent, CaseStatus } from "@/lib/cases/types";
import type { CustomerPosture, CustomerTimelineEntry } from "@/lib/portal/types";

// ---- Status -----------------------------------------------------------
// "Escalated" is an internal routing state — it means a case got a senior
// analyst's attention, not that something is more dangerous. Customers
// should read it as progress, so it gets a calm label and tone, never the
// internal alarm-red used for genuinely urgent things elsewhere in the app.

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

// ---- Posture ------------------------------------------------------------
// Derived from open high-severity cases, never a raw number. Reads
// risk_score internally to classify — the number itself never leaves this
// function.

export const CUSTOMER_POSTURE_LABEL: Record<CustomerPosture, string> = {
  protected: "Protected",
  monitoring: "Monitoring",
  active_incident: "Active Incident",
};

export const CUSTOMER_POSTURE_DESCRIPTION: Record<CustomerPosture, string> = {
  protected: "No open incidents. Your environment is fully monitored.",
  monitoring: "One or more incidents are open and being worked by your SOC team.",
  active_incident: "A high-priority incident is receiving active attention right now.",
};

export const CUSTOMER_POSTURE_TONE: Record<CustomerPosture, BadgeTone> = {
  protected: "emerald",
  monitoring: "blue",
  active_incident: "amber",
};

export function derivePosture(cases: Case[]): CustomerPosture {
  const open = cases.filter((c) => c.status !== "resolved");
  if (open.length === 0) return "protected";
  const hasHighSeverity = open.some(
    (c) => getRiskTier(c.risk_score) === "critical"
  );
  return hasHighSeverity ? "active_incident" : "monitoring";
}

// ---- Evidence -------------------------------------------------------------
// Lookup table keyed by the case title (the closest thing to a "detection
// description" on the Case model) -> a plain-language sentence. Anything not
// in the table falls back to a generic, severity-aware sentence rather than
// showing the technical title as-is.

const EVIDENCE_DESCRIPTIONS: Record<string, string> = {
  "Suspicious Encoded PowerShell Execution":
    "A device ran a hidden command that tried to reach out to the internet.",
  "Multiple Failed SSH Login Attempts":
    "Repeated failed sign-in attempts were made against one of your systems from an outside address.",
  "Ransomware Indicators on File Server":
    "A pattern matching ransomware behavior was detected on a shared file server.",
  "Unusual Outbound DNS Query Volume":
    "A device sent an unusually high number of lookup requests to an uncommon destination.",
  "Privilege Escalation via Scheduled Task":
    "A scheduled task was created that gave a process higher access than expected.",
  "Antivirus Detection Auto-Quarantined":
    "Antivirus software automatically identified and isolated a suspicious file.",
  "Suspicious Lateral Movement via SMB":
    "A device accessed an administrative file share it doesn't normally use.",
  "Password Policy Violation Alert":
    "Repeated sign-in failures triggered an account lockout.",
};

// Severity is the raw 0-15 detection-engine scale (see lib/alerts/severity.ts
// for the same 12+ = high-severity convention used elsewhere) — used only to
// pick a fallback sentence, never rendered as a number.
function genericEvidenceFallback(severity: number): string {
  if (severity >= 12) {
    return "A high-priority security event was detected and is under active review.";
  }
  if (severity >= 7) {
    return "A security event was detected and is being reviewed by your SOC team.";
  }
  return "A routine security event was detected and reviewed by your SOC team.";
}

export function describeEvidence(caseData: Pick<Case, "title" | "severity">): string {
  return EVIDENCE_DESCRIPTIONS[caseData.title] ?? genericEvidenceFallback(caseData.severity);
}

// ---- Ownership --------------------------------------------------------
// Tier/level only — never a name.

export function describeOwnership(
  caseData: Pick<Case, "status" | "assigned_analyst">
): string {
  if (!caseData.assigned_analyst) return "Awaiting assignment";
  return caseData.status === "escalated"
    ? "Senior analyst (L2/L3)"
    : "SOC analyst (L1)";
}

// ---- Timeline -----------------------------------------------------------
// Filters out internal-only noise (notes, actor identities, raw status
// strings) and relabels what's left in customer-safe language. A
// status_change that doesn't change the customer-visible label (e.g.
// "new" -> "investigating", both "Under Review") is a no-op to a customer
// and gets dropped.

export function buildCustomerTimeline(events: CaseEvent[]): CustomerTimelineEntry[] {
  const sorted = [...events].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const entries: CustomerTimelineEntry[] = [];
  let lastCustomerStatus: string | null = null;

  for (const event of sorted) {
    switch (event.type) {
      case "assignment": {
        entries.push({
          id: event.id,
          type: "update",
          message: "A member of your security team began investigating.",
          created_at: event.created_at,
        });
        break;
      }
      case "status_change": {
        const match = event.message.match(/from (\w+) to (\w+)/);
        const toStatus = (match?.[2] as CaseStatus | undefined) ?? undefined;
        const label = toStatus ? CUSTOMER_STATUS_LABEL[toStatus] : undefined;
        if (!label || label === lastCustomerStatus) break; // no-op to a customer
        lastCustomerStatus = label;
        entries.push({
          id: event.id,
          type: "update",
          message: `Status updated to ${label}.`,
          created_at: event.created_at,
        });
        break;
      }
      case "escalation": {
        entries.push({
          id: event.id,
          type: "escalation",
          message: "This case was escalated internally for senior review.",
          created_at: event.created_at,
        });
        break;
      }
      case "verdict": {
        entries.push({
          id: event.id,
          type: "resolution",
          message: "This case was resolved and guidance was published.",
          created_at: event.created_at,
        });
        break;
      }
      case "note":
        // Internal analyst working notes — never customer-facing.
        break;
    }
  }

  return entries;
}

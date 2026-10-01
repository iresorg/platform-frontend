import { computeRiskScore } from "@/lib/cases/risk";
import type { Case, CaseEvent, CaseEventType, CaseStatus } from "@/lib/cases/types";
import type { Incident, IncidentListItem, IncidentSeverity, IncidentStatus } from "@/lib/incidents/types";

// The customer portal was built against a "Case" view model. The backend
// serves incidents, so this is the single place one is turned into the
// other — and the place that decides what may reach a customer screen.
//
// Deliberately NOT carried over: the technical `description`, the rule ID,
// the raw log, internal notes and the enrichment payload. Only fields the
// portal is allowed to show, or that it needs to classify without showing.

// Internal only: used to order and to derive the posture tier, never
// rendered as a number.
const SEVERITY_LEVEL: Record<IncidentSeverity, number> = { LOW: 4, MEDIUM: 8, HIGH: 11, CRITICAL: 14 };

export function toCaseStatus(status: IncidentStatus): CaseStatus {
  if (status === "OPEN") return "new";
  if (status === "INVESTIGATING") return "investigating";
  return "resolved";
}

export function toCase(
  incident: IncidentListItem | Incident,
  tenant: { id: string; name: string }
): Case {
  const severity = SEVERITY_LEVEL[incident.severity] ?? 4;
  const guidance = "resolution_summary" in incident ? incident.resolution_summary : "";
  const status = toCaseStatus(incident.status);
  return {
    id: incident.id,
    customer_id: tenant.id,
    customer_name: tenant.name,
    source: incident.source_type,
    severity,
    risk_score: computeRiskScore(severity, incident.intel_score ?? 0),
    status,
    assigned_analyst: incident.assigned_to_email
      ? { id: incident.assigned_to_email, name: incident.assigned_to_email }
      : null,
    title: incident.title,
    summary: incident.summary ?? "",
    sla_due_at: incident.sla_due_at ?? incident.created_at,
    created_at: incident.created_at,
    verdict:
      status === "resolved" && guidance
        ? { notes: "", customer_guidance: guidance }
        : null,
    opencti_enrichment: null,
    raw_alert_ref: { agent_id: incident.agent_id, agent_name: incident.agent_name, rule_id: "", full_log: "" },
  };
}

const LEGACY_STATUS_WORD: Record<string, CaseStatus> = {
  open: "new",
  investigating: "investigating",
  resolved: "resolved",
  closed: "resolved",
};

// Notes are free text written by analysts, so this reads them strictly:
// only the backend's own fixed phrasing counts as a status change,
// assignment or escalation. Anything else — including an analyst
// mentioning the word "resolved" — stays an internal note, which the
// customer timeline drops. Guessing wrong here would tell a customer their
// case was closed when it wasn't.
export function toEvents(incident: Incident): CaseEvent[] {
  const sorted = [...incident.notes].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  let previous: CaseStatus = "new";
  return sorted.map((n) => {
    let type: CaseEventType = "note";
    let message = n.content;
    const kind = (n.event_type ?? "").toLowerCase();
    const statusMatch = n.content.match(/^Status changed to (\w+)/i);
    if (statusMatch && LEGACY_STATUS_WORD[statusMatch[1].toLowerCase()]) {
      const next = LEGACY_STATUS_WORD[statusMatch[1].toLowerCase()];
      type = next === "resolved" ? "verdict" : "status_change";
      // customer-view reads "from X to Y"; the backend only says "to Y".
      message = `Status changed from ${previous} to ${next}`;
      previous = next;
    } else if (/assign/.test(kind) || /^(case|incident) assigned to/i.test(n.content)) {
      type = "assignment";
    } else if (/escalat/.test(kind) || /^escalated/i.test(n.content)) {
      type = "escalation";
    }
    return { id: n.id, case_id: incident.id, type, message, actor_name: n.author_email, created_at: n.created_at };
  });
}

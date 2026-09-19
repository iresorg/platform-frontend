import { getSlaState } from "@/lib/cases/sla";
import { getRiskTier } from "@/lib/cases/risk";
import type { Case } from "@/lib/cases/types";

export interface CaseMetrics {
  unassigned: number;
  nearSlaBreach: number;
  critical: number;
  assignedToMe: number;
}

export function computeCaseMetrics(
  cases: Case[],
  now: Date = new Date(),
  userId?: string
): CaseMetrics {
  const active = cases.filter((c) => c.status !== "resolved");

  return {
    unassigned: active.filter((c) => c.assigned_analyst === null).length,
    nearSlaBreach: active.filter(
      (c) => getSlaState(c.sla_due_at, now) === "near-breach"
    ).length,
    // Driven by the combined risk score (severity + threat-intel
    // confidence), not severity alone — matches the pipeline's own
    // auto_contain gate rather than double-counting a raw Wazuh level.
    critical: active.filter((c) => getRiskTier(c.risk_score) === "critical")
      .length,
    assignedToMe: userId
      ? active.filter((c) => c.assigned_analyst?.id === userId).length
      : 0,
  };
}

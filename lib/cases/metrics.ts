import { getSlaState } from "@/lib/cases/sla";
import type { Case } from "@/lib/cases/types";

export interface CaseMetrics {
  unassigned: number;
  nearSlaBreach: number;
  critical: number;
  assignedToMe: number;
}

const CRITICAL_SEVERITY_THRESHOLD = 10;

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
    critical: active.filter((c) => c.severity >= CRITICAL_SEVERITY_THRESHOLD)
      .length,
    assignedToMe: userId
      ? active.filter((c) => c.assigned_analyst?.id === userId).length
      : 0,
  };
}

import { getRiskTier } from "@/lib/cases/risk";
import type { Case } from "@/lib/cases/types";
import type { BadgeTone } from "@/components/ui/color-badge";

export type ThreatLevel = "low" | "elevated" | "critical";

// Org-wide aggregate, not a per-case signal: the loudest active case sets
// the level for the whole board.
export function computeThreatLevel(cases: Case[]): ThreatLevel {
  const active = cases.filter((c) => c.status !== "resolved");
  if (active.some((c) => getRiskTier(c.risk_score) === "critical")) {
    return "critical";
  }
  if (active.some((c) => getRiskTier(c.risk_score) === "elevated")) {
    return "elevated";
  }
  return "low";
}

export const THREAT_LEVEL_LABEL: Record<ThreatLevel, string> = {
  critical: "Critical",
  elevated: "Elevated",
  low: "Normal",
};

export const THREAT_LEVEL_TONE: Record<ThreatLevel, BadgeTone> = {
  critical: "red",
  elevated: "amber",
  low: "emerald",
};

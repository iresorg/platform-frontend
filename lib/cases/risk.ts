import type { BadgeTone } from "@/components/ui/color-badge";

// Mirrors the pipeline's own combined_risk_score(wazuh_level, opencti_confidence)
// from the MVP Requirements & Design doc — kept here so mock data and any
// future client-side recompute use the exact same formula as the backend.
export function computeRiskScore(
  wazuhLevel: number,
  openctiConfidence: number
): number {
  return Math.round((wazuhLevel / 15) * 60 + (openctiConfidence / 100) * 40);
}

export type RiskTier = "critical" | "elevated" | "low";

// Thresholds match decide_action(): >=85 auto_contain-eligible, >=60
// escalate_l1, else log_only.
export function getRiskTier(riskScore: number): RiskTier {
  if (riskScore >= 85) return "critical";
  if (riskScore >= 60) return "elevated";
  return "low";
}

export const RISK_TIER_TONE: Record<RiskTier, BadgeTone> = {
  critical: "red",
  elevated: "amber",
  low: "slate",
};

export const RISK_TIER_LABEL: Record<RiskTier, string> = {
  critical: "Critical",
  elevated: "Elevated",
  low: "Low",
};

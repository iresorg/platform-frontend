import type { BadgeTone } from "@/components/ui/color-badge";

// Wazuh rule_level is 0-15. Buckets follow the iRES frontend guide:
// Low up to 6, Medium 7-9, High 10-12, Critical 13-15.
export type RuleLevelTier = "critical" | "high" | "medium" | "low";

export function getRuleLevelTier(level: number): RuleLevelTier {
  if (level >= 13) return "critical";
  if (level >= 10) return "high";
  if (level >= 7) return "medium";
  return "low";
}

export const RULE_LEVEL_TIER_LABEL: Record<RuleLevelTier, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

// grey / yellow / orange / red
export const RULE_LEVEL_TIER_TONE: Record<RuleLevelTier, BadgeTone> = {
  critical: "red",
  high: "orange",
  medium: "amber",
  low: "slate",
};

export const INCIDENT_SEVERITY_TONE: Record<string, BadgeTone> = {
  CRITICAL: "red",
  HIGH: "orange",
  MEDIUM: "amber",
  LOW: "slate",
};

// Suggested incident severity when escalating, from the alert's rule level.
export function ruleLevelToIncidentSeverity(level: number): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
  const tier = getRuleLevelTier(level);
  return tier === "critical" ? "CRITICAL" : tier === "high" ? "HIGH" : tier === "medium" ? "MEDIUM" : "LOW";
}

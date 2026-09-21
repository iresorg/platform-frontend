import type { BadgeTone } from "@/components/ui/color-badge";

// Wazuh rule_level runs roughly 0-16. The backend doesn't define bucket
// boundaries, so this follows the common Wazuh convention (12+ treated as
// high-severity) rather than an iRES-specific cutoff — revisit once the
// backend exposes its own severity_distribution buckets from /alerts/stats/.
export type RuleLevelTier = "critical" | "high" | "medium" | "low";

export function getRuleLevelTier(level: number): RuleLevelTier {
  if (level >= 12) return "critical";
  if (level >= 8) return "high";
  if (level >= 4) return "medium";
  return "low";
}

export const RULE_LEVEL_TIER_TONE: Record<RuleLevelTier, BadgeTone> = {
  critical: "red",
  high: "amber",
  medium: "blue",
  low: "slate",
};

export const INCIDENT_SEVERITY_TONE: Record<string, BadgeTone> = {
  CRITICAL: "red",
  HIGH: "amber",
  MEDIUM: "blue",
  LOW: "slate",
};

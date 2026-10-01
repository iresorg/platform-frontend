import { ColorBadge, type BadgeTone } from "@/components/ui/color-badge";
import {
  getRuleLevelTier,
  RULE_LEVEL_TIER_LABEL,
  RULE_LEVEL_TIER_TONE,
} from "@/lib/alerts/severity";
import type { IncidentSeverity } from "@/lib/incidents/types";

const SEVERITY_TONE: Record<IncidentSeverity, BadgeTone> = {
  LOW: "slate",
  MEDIUM: "amber",
  HIGH: "orange",
  CRITICAL: "red",
};

const SEVERITY_LABEL: Record<IncidentSeverity, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

// Two inputs, one look: alerts carry Wazuh's 0-15 rule level (shown as the
// number plus its tier, because analysts learn the levels), while cases
// carry a LOW..CRITICAL word. Both land on the same four tones —
// grey / yellow / orange / red.
export function SeverityBadge({
  level,
  severity,
}: {
  level?: number;
  severity?: IncidentSeverity;
}) {
  if (level !== undefined) {
    const tier = getRuleLevelTier(level);
    return (
      <ColorBadge tone={RULE_LEVEL_TIER_TONE[tier]} aria-label={`Severity ${level}, ${RULE_LEVEL_TIER_LABEL[tier]}`}>
        {level} · {RULE_LEVEL_TIER_LABEL[tier]}
      </ColorBadge>
    );
  }
  if (severity) {
    return <ColorBadge tone={SEVERITY_TONE[severity] ?? "slate"}>{SEVERITY_LABEL[severity] ?? severity}</ColorBadge>;
  }
  return null;
}

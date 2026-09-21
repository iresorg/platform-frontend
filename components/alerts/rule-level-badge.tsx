import { ColorBadge } from "@/components/ui/color-badge";
import { getRuleLevelTier, RULE_LEVEL_TIER_TONE } from "@/lib/alerts/severity";

export function RuleLevelBadge({ level }: { level: number }) {
  const tier = getRuleLevelTier(level);
  return (
    <ColorBadge tone={RULE_LEVEL_TIER_TONE[tier]}>LEVEL {level}</ColorBadge>
  );
}

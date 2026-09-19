import { ColorBadge } from "@/components/ui/color-badge";
import { getRiskTier, RISK_TIER_TONE } from "@/lib/cases/risk";

export function RiskBadge({ riskScore }: { riskScore: number }) {
  const tier = getRiskTier(riskScore);
  return (
    <ColorBadge
      tone={RISK_TIER_TONE[tier]}
      aria-label={`Combined risk score: ${riskScore} out of 100`}
    >
      RISK {riskScore}
    </ColorBadge>
  );
}

import { SeverityBadge } from "@/components/shared/severity-badge";

export function RuleLevelBadge({ level }: { level: number }) {
  return <SeverityBadge level={level} />;
}

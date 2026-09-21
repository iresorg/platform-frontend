import { ColorBadge } from "@/components/ui/color-badge";
import { INCIDENT_SEVERITY_TONE } from "@/lib/alerts/severity";
import type { IncidentSeverity } from "@/lib/incidents/types";

export function IncidentSeverityBadge({ severity }: { severity: IncidentSeverity }) {
  return (
    <ColorBadge tone={INCIDENT_SEVERITY_TONE[severity] ?? "slate"}>
      {severity}
    </ColorBadge>
  );
}

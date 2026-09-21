import { ColorBadge, type BadgeTone } from "@/components/ui/color-badge";
import type { IncidentStatus } from "@/lib/incidents/types";

const STATUS_TONE: Record<IncidentStatus, BadgeTone> = {
  OPEN: "blue",
  INVESTIGATING: "amber",
  RESOLVED: "emerald",
  CLOSED: "slate",
};

function titleCase(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

export function IncidentStatusBadge({ status }: { status: IncidentStatus }) {
  return (
    <ColorBadge tone={STATUS_TONE[status]} variant="outline">
      {titleCase(status)}
    </ColorBadge>
  );
}

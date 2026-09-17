import { ColorBadge, type BadgeTone } from "@/components/ui/color-badge";
import type { CaseStatus } from "@/lib/cases/types";

const LABELS: Record<CaseStatus, string> = {
  new: "Under Review",
  investigating: "Under Review",
  escalated: "Priority Review",
  resolved: "Resolved",
};

const TONES: Record<CaseStatus, BadgeTone> = {
  new: "blue",
  investigating: "blue",
  escalated: "red",
  resolved: "emerald",
};

export function CustomerStatusBadge({ status }: { status: CaseStatus }) {
  return (
    <ColorBadge tone={TONES[status]} variant="outline">
      {LABELS[status]}
    </ColorBadge>
  );
}

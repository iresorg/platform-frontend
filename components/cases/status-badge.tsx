import { ColorBadge, type BadgeTone } from "@/components/ui/color-badge";
import type { CaseStatus } from "@/lib/cases/types";

const LABELS: Record<CaseStatus, string> = {
  new: "New",
  investigating: "Investigating",
  escalated: "Escalated",
  resolved: "Resolved",
};

const TONES: Record<CaseStatus, BadgeTone> = {
  new: "blue",
  investigating: "amber",
  escalated: "red",
  resolved: "emerald",
};

export function StatusBadge({ status }: { status: CaseStatus }) {
  return <ColorBadge tone={TONES[status]}>{LABELS[status]}</ColorBadge>;
}

import { CheckCircle2, Clock, Sparkles, XCircle } from "lucide-react";
import { ColorBadge, type BadgeTone } from "@/components/ui/color-badge";

export type AiDraftStatus = "pending_review" | "approved" | "rejected" | "not_generated";

const STATUS: Record<AiDraftStatus, { label: string; tone: BadgeTone; icon: React.ElementType }> = {
  pending_review: { label: "AI draft — awaiting review", tone: "amber", icon: Clock },
  approved: { label: "AI draft — approved", tone: "emerald", icon: CheckCircle2 },
  rejected: { label: "AI draft — rejected", tone: "slate", icon: XCircle },
  not_generated: { label: "AI unavailable", tone: "slate", icon: Sparkles },
};

export function DraftBadge({ status }: { status: AiDraftStatus }) {
  const s = STATUS[status];
  const Icon = s.icon;
  return (
    <ColorBadge tone={s.tone} variant="outline">
      <Icon className="mr-1 size-3" aria-hidden="true" />
      {s.label}
    </ColorBadge>
  );
}

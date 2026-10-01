"use client";

import { ColorBadge } from "@/components/ui/color-badge";
import { useNow } from "@/hooks/use-now";

const FIFTEEN_MIN = 15 * 60_000;

function formatRemaining(ms: number): string {
  const total = Math.floor(Math.abs(ms) / 1000);
  const days = Math.floor(total / 86_400);
  const hours = Math.floor((total % 86_400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes >= 15) return `${minutes}m`;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

// Green above 15 minutes, amber with a gentle pulse at 15 or less, red and
// labelled BREACHED once due. Ticks every second so the last quarter hour
// reads as a live countdown between data polls.
export function SLABadge({
  dueAt,
  done = false,
}: {
  dueAt: string | null | undefined;
  done?: boolean;
}) {
  const now = useNow(1000);
  if (!dueAt || done) return <span className="text-muted-foreground">—</span>;

  const remaining = new Date(dueAt).getTime() - now.getTime();
  if (Number.isNaN(remaining)) return <span className="text-muted-foreground">—</span>;

  if (remaining <= 0) {
    return (
      <ColorBadge tone="red" aria-label={`SLA breached ${formatRemaining(remaining)} ago`}>
        BREACHED
      </ColorBadge>
    );
  }
  if (remaining <= FIFTEEN_MIN) {
    return (
      <ColorBadge tone="amber" pulse aria-label={`SLA due in ${formatRemaining(remaining)}`}>
        {formatRemaining(remaining)}
      </ColorBadge>
    );
  }
  return (
    <ColorBadge tone="emerald" aria-label={`SLA due in ${formatRemaining(remaining)}`}>
      {formatRemaining(remaining)}
    </ColorBadge>
  );
}

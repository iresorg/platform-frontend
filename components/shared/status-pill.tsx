import { ColorBadge, type BadgeTone } from "@/components/ui/color-badge";

// One colour per state, used everywhere a status appears — cases and
// alerts share a vocabulary, so "in progress" never changes colour
// between screens.
const STATUS_TONE: Record<string, BadgeTone> = {
  NEW: "blue",
  OPEN: "blue",
  ACKNOWLEDGED: "blue",
  INVESTIGATING: "amber",
  IN_PROGRESS: "amber",
  ESCALATED: "orange",
  RESOLVED: "emerald",
  CLOSED: "slate",
  DISMISSED: "slate",
};

function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function StatusPill({ status }: { status: string }) {
  const key = status.toUpperCase();
  return (
    <ColorBadge tone={STATUS_TONE[key] ?? "slate"} variant="outline">
      {titleCase(key)}
    </ColorBadge>
  );
}

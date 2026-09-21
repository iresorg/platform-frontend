import { ColorBadge, type BadgeTone } from "@/components/ui/color-badge";

// Status values confirmed from GET /alerts/stats/. Anything else still
// renders (title-cased, neutral tone) rather than crashing.
const KNOWN_STATUS_TONE: Record<string, BadgeTone> = {
  NEW: "blue",
  ACKNOWLEDGED: "amber",
  IN_PROGRESS: "amber",
  RESOLVED: "emerald",
  DISMISSED: "slate",
};

function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function AlertStatusBadge({ status }: { status: string }) {
  const tone = KNOWN_STATUS_TONE[status.toUpperCase()] ?? "slate";
  return (
    <ColorBadge tone={tone} variant="outline">
      {titleCase(status)}
    </ColorBadge>
  );
}

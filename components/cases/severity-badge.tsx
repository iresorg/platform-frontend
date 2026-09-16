import { ColorBadge, type BadgeTone } from "@/components/ui/color-badge";

function band(severity: number): { label: string; tone: BadgeTone } {
  if (severity >= 10) return { label: "Critical", tone: "red" };
  if (severity >= 5) return { label: "Elevated", tone: "amber" };
  return { label: "Low", tone: "slate" };
}

export function SeverityBadge({ severity }: { severity: number }) {
  const { label, tone } = band(severity);
  return (
    <ColorBadge tone={tone}>
      SEV {severity} · {label.toUpperCase()}
    </ColorBadge>
  );
}

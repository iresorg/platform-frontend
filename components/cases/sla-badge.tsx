import { ColorBadge, type BadgeTone } from "@/components/ui/color-badge";
import { formatSlaCountdown, getSlaState } from "@/lib/cases/sla";

const TONES: Record<string, BadgeTone> = {
  safe: "emerald",
  "near-breach": "amber",
  breached: "red",
};

export function SlaBadge({
  slaDueAt,
  now,
}: {
  slaDueAt: string;
  now: Date;
}) {
  const state = getSlaState(slaDueAt, now);
  const label =
    state === "breached" ? "BREACHED" : formatSlaCountdown(slaDueAt, now);
  const stateLabel =
    state === "breached"
      ? "SLA breached"
      : state === "near-breach"
        ? "Near SLA breach"
        : "SLA on track";

  return (
    <ColorBadge
      tone={TONES[state]}
      pulse={state === "near-breach"}
      aria-label={`${stateLabel}: ${label}`}
    >
      {label}
    </ColorBadge>
  );
}

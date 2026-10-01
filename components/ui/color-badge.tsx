import { cn } from "cn";

// Tones resolve to the semantic tokens in globals.css, so every badge in
// the app changes together with the palette (light and dark included).
const FILLED_TONES = {
  blue: "bg-tone-blue-bg text-tone-blue-fg",
  amber: "bg-tone-amber-bg text-tone-amber-fg",
  orange: "bg-tone-orange-bg text-tone-orange-fg",
  red: "bg-tone-red-bg text-tone-red-fg",
  emerald: "bg-tone-green-bg text-tone-green-fg",
  slate: "bg-tone-gray-bg text-tone-gray-fg",
} as const;

// Outline tones are deliberately fill-free: status is informational, not a
// risk signal, so it shouldn't compete visually with severity/SLA fills.
const OUTLINE_TONES = {
  blue: "border-tone-blue-line text-tone-blue-fg",
  amber: "border-tone-amber-line text-tone-amber-fg",
  orange: "border-tone-orange-line text-tone-orange-fg",
  red: "border-tone-red-line text-tone-red-fg",
  emerald: "border-tone-green-line text-tone-green-fg",
  slate: "border-tone-gray-line text-tone-gray-fg",
} as const;

export type BadgeTone = keyof typeof FILLED_TONES;
export type BadgeVariant = "filled" | "outline";

export function ColorBadge({
  tone,
  variant = "filled",
  children,
  className,
  pulse = false,
  "aria-label": ariaLabel,
}: {
  tone: BadgeTone;
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  pulse?: boolean;
  "aria-label"?: string;
}) {
  return (
    <span
      aria-label={ariaLabel}
      className={cn(
        "inline-flex w-fit shrink-0 items-center rounded-full px-2 py-0.5 text-xs font-bold whitespace-nowrap",
        variant === "filled"
          ? FILLED_TONES[tone]
          : cn("border bg-transparent", OUTLINE_TONES[tone]),
        pulse && "motion-safe:animate-[badge-ring_1.8s_ease-in-out_infinite]",
        className
      )}
    >
      {children}
    </span>
  );
}

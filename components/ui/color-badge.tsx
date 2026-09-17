import { cn } from "cn";

const FILLED_TONES = {
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-400",
  amber:
    "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
  red: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400",
  emerald:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400",
  slate:
    "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
} as const;

// Outline tones are deliberately fill-free: status is informational, not a
// risk signal, so it shouldn't compete visually with severity/SLA fills.
const OUTLINE_TONES = {
  blue: "border-blue-300 text-blue-700 dark:border-blue-800 dark:text-blue-400",
  amber:
    "border-amber-300 text-amber-700 dark:border-amber-800 dark:text-amber-400",
  red: "border-red-300 text-red-700 dark:border-red-800 dark:text-red-400",
  emerald:
    "border-emerald-300 text-emerald-700 dark:border-emerald-800 dark:text-emerald-400",
  slate:
    "border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300",
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
        pulse && "motion-safe:animate-pulse",
        className
      )}
    >
      {children}
    </span>
  );
}

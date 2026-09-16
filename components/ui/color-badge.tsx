import { cn } from "cn";

const TONES = {
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-400",
  amber:
    "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400",
  red: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-400",
  emerald:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400",
  slate:
    "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
} as const;

export type BadgeTone = keyof typeof TONES;

export function ColorBadge({
  tone,
  children,
  className,
  pulse = false,
  "aria-label": ariaLabel,
}: {
  tone: BadgeTone;
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
        TONES[tone],
        pulse && "motion-safe:animate-pulse",
        className
      )}
    >
      {children}
    </span>
  );
}

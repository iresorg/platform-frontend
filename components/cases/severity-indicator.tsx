import { cn } from "cn";

function severityDotClass(severity: number): string {
  if (severity >= 10) return "bg-destructive";
  if (severity >= 5) return "bg-amber-500";
  return "bg-muted-foreground";
}

export function SeverityIndicator({ severity }: { severity: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-sm tabular-nums">
      <span
        className={cn("size-1.5 shrink-0 rounded-full", severityDotClass(severity))}
        aria-hidden
      />
      {severity}
    </span>
  );
}

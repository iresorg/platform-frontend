import {
  ArrowUpCircle,
  CheckCircle2,
  MessageSquare,
  RefreshCw,
  UserPlus,
} from "lucide-react";
import { cn } from "cn";
import type { CaseEvent, CaseEventType } from "@/lib/cases/types";

const ICONS: Record<CaseEventType, React.ComponentType<{ className?: string }>> = {
  assignment: UserPlus,
  status_change: RefreshCw,
  escalation: ArrowUpCircle,
  note: MessageSquare,
  verdict: CheckCircle2,
};

const TONES: Record<CaseEventType, string> = {
  assignment: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
  status_change:
    "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300",
  escalation: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  note: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300",
  verdict:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
};

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function CaseTimeline({
  events,
  showActor = true,
}: {
  events: CaseEvent[];
  showActor?: boolean;
}) {
  const sorted = [...events].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
    );
  }

  return (
    <ol className="flex flex-col">
      {sorted.map((event, index) => {
        const Icon = ICONS[event.type];
        const isLast = index === sorted.length - 1;
        return (
          <li key={event.id} className="relative flex gap-3 pb-6 last:pb-0">
            {!isLast && (
              <span
                aria-hidden="true"
                className="absolute top-7 bottom-0 left-[13.5px] w-px bg-border"
              />
            )}
            <span
              className={cn(
                "relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full",
                TONES[event.type]
              )}
            >
              <Icon className="size-3.5" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-0.5 pt-0.5">
              <p className="text-sm">{event.message}</p>
              <p className="text-xs text-muted-foreground">
                {formatTimestamp(event.created_at)}
                {showActor && ` · ${event.actor_name}`}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

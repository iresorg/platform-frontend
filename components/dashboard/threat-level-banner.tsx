import { AlertTriangle, ShieldCheck, ShieldAlert } from "lucide-react";
import {
  computeThreatLevel,
  THREAT_LEVEL_LABEL,
} from "@/lib/cases/threat-level";
import type { Case } from "@/lib/cases/types";

const COPY: Record<
  ReturnType<typeof computeThreatLevel>,
  { icon: typeof ShieldCheck; description: string; classes: string }
> = {
  critical: {
    icon: AlertTriangle,
    description:
      "At least one active case is scoring critical risk. Prioritize the escalation queue.",
    classes:
      "border-red-200 bg-red-50 text-red-900 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200",
  },
  elevated: {
    icon: ShieldAlert,
    description: "Active cases with elevated risk are in the queue.",
    classes:
      "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200",
  },
  low: {
    icon: ShieldCheck,
    description: "No active case is currently scoring elevated or critical risk.",
    classes:
      "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200",
  },
};

export function ThreatLevelBanner({ cases }: { cases: Case[] }) {
  const level = computeThreatLevel(cases);
  const { icon: Icon, description, classes } = COPY[level];

  return (
    <div className={`flex items-center gap-3 rounded-xl border px-5 py-4 ${classes}`}>
      <Icon className="size-6 shrink-0" aria-hidden="true" />
      <div>
        <p className="font-heading font-bold">
          Threat level: {THREAT_LEVEL_LABEL[level]}
        </p>
        <p className="mt-0.5 text-sm opacity-90">{description}</p>
      </div>
    </div>
  );
}

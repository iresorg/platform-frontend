"use client";

import { AlertOctagon, Building2, Clock } from "lucide-react";
import { IncidentCommandCard } from "@/components/dashboard/incident-command-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCasesQuery } from "@/lib/cases/queries";

function ageInHours(iso: string): number {
  return Math.round((Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60));
}

export default function IncidentCommandPage() {
  const { data: cases, isLoading } = useCasesQuery();
  const allCases = cases ?? [];
  const majorIncidents = allCases
    .filter((c) => c.status === "escalated")
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const customersAffected = new Set(majorIncidents.map((c) => c.customer_name)).size;
  const oldest = majorIncidents[0];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl">Incident Command</h1>
        <p className="text-sm text-muted-foreground">
          Executive view of every escalated, org-wide major incident.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertOctagon className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-2xl leading-none font-bold">{majorIncidents.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">Major Incidents</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
            <Building2 className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-2xl leading-none font-bold">{customersAffected}</p>
            <p className="mt-1 text-xs text-muted-foreground">Customers Affected</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
            <Clock className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-2xl leading-none font-bold">
              {oldest ? `${ageInHours(oldest.created_at)}h` : "—"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Longest Open</p>
          </div>
        </div>
      </div>

      {majorIncidents.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-sm">
          No active major incidents. Escalated cases will appear here.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {majorIncidents.map((c) => (
            <IncidentCommandCard key={c.id} caseData={c} />
          ))}
        </div>
      )}
    </div>
  );
}

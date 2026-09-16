"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { MetricsBar } from "@/components/dashboard/metrics-bar";
import { TriageQueue } from "@/components/cases/triage-queue";
import { useNow } from "@/hooks/use-now";
import { useCasesQuery } from "@/lib/cases/queries";

export default function CasesPage() {
  const { user } = useAuth();
  const now = useNow();
  const { data } = useCasesQuery();

  return (
    <div className="flex flex-col gap-4">
      <MetricsBar cases={data ?? []} now={now} userId={user?.id} />
      <h1 className="text-xl">Triage Queue</h1>
      <TriageQueue />
    </div>
  );
}

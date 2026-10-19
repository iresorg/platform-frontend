"use client";

import type { ReactNode } from "react";
import { Clock } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { useMockVisible } from "@/hooks/use-mock-visible";

// Wraps a mock-backed screen's content. Staff and the demo tenant still
// see the mock data (with its banner); a real tenant user in production
// sees this instead — see hooks/use-mock-visible.ts for why.
export function MockGate({ children }: { children: ReactNode }) {
  const mockVisible = useMockVisible();
  if (mockVisible) return <>{children}</>;
  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <EmptyState
        icon={Clock}
        title="Coming soon"
        description="This isn't connected yet — check back soon."
      />
    </section>
  );
}

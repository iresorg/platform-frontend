"use client";

// Stands in for the `posture` field on GET /portal/overview — see the
// backend asks list. The rest of that endpoint (protection_status,
// endpoints, month, attention, recent) is real; only the score is mocked.

import { useQuery } from "@tanstack/react-query";
import { mockDelay } from "@/lib/mocks/helpers";

export interface MockPosture {
  score: number;
  trend: "up" | "down" | "flat";
  label: string;
}

export function useMockPostureQuery() {
  return useQuery({
    queryKey: ["mock", "posture"],
    queryFn: (): Promise<MockPosture> => mockDelay({ score: 78, trend: "up", label: "Good" }),
  });
}

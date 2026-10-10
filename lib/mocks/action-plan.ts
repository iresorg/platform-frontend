"use client";

// Stands in for GET /portal/action-plan, POST /portal/action-plan/:id/done
// — see the backend asks list. Only approved AI/analyst items are meant
// to appear here; this mock seeds a few directly since there's no real
// approval pipeline to draw from yet.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mockDelay } from "@/lib/mocks/helpers";

export type ActionPlanStatus = "open" | "rescan_pending" | "fixed" | "still_open";

export interface MockActionItem {
  id: string;
  title: string;
  why_it_matters: string;
  steps: string[];
  devices: string[];
  due_by: string;
  status: ActionPlanStatus;
  status_label: string;
}

const STATUS_LABEL: Record<ActionPlanStatus, string> = {
  open: "To do",
  rescan_pending: "Checking your fix",
  fixed: "Fixed",
  still_open: "Still needs attention",
};

let items: MockActionItem[] = [
  {
    id: "plan-1",
    title: "Update remote login software",
    why_it_matters: "An attacker could sign in without a password using this weakness.",
    steps: ["Install the latest security update on FILESRV-01", "Restart the service", "Confirm the version shows the patched build"],
    devices: ["FILESRV-01"],
    due_by: new Date(Date.now() + 2 * 86_400_000).toISOString(),
    status: "open",
    status_label: STATUS_LABEL.open,
  },
  {
    id: "plan-2",
    title: "Turn on disk encryption",
    why_it_matters: "Protects your data if a laptop is lost or stolen.",
    steps: ["Enable BitLocker (Windows) or FileVault (Mac)", "Store the recovery key somewhere safe"],
    devices: ["MER-VI-WS09"],
    due_by: new Date(Date.now() + 14 * 86_400_000).toISOString(),
    status: "rescan_pending",
    status_label: STATUS_LABEL.rescan_pending,
  },
];

export function useMockActionPlanQuery() {
  return useQuery({ queryKey: ["mock", "action-plan"], queryFn: () => mockDelay(items) });
}

export function useMockMarkDoneMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      items = items.map((i) => (i.id === id ? { ...i, status: "rescan_pending" as const, status_label: STATUS_LABEL.rescan_pending } : i));
      await mockDelay(null, 200);
      // Resolves to fixed shortly after, same "wait for the real rescan"
      // shape the guide insists on — never flips to Fixed on click.
      setTimeout(() => {
        items = items.map((i) => (i.id === id ? { ...i, status: "fixed" as const, status_label: STATUS_LABEL.fixed } : i));
      }, 4000);
      return items.find((i) => i.id === id)!;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["mock", "action-plan"] }),
  });
}

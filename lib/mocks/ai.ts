"use client";

// Stands in for GET /ai/drafts, PATCH /ai/drafts/:id, approve/reject —
// see the backend asks list. No AI gateway exists yet; this is the only
// mock module where "AI switched off" (not_generated for every case) is
// actually the honest default. The handful of pending/approved/rejected
// rows here exist to let the review-queue and panel UI be checked at
// all, not because any draft is real.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AiDraftStatus } from "@/components/shared/draft-badge";
import { mockDelay } from "@/lib/mocks/helpers";

export interface MockAiDraft {
  id: string;
  case_id: string;
  tenant_name: string;
  kind: "guidance" | "remediation" | "action_plan_item";
  body: string;
  tenant_preview: string;
  status: AiDraftStatus;
  generated_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  reject_reason: string | null;
  has_placeholder_defect: boolean;
}

let drafts: MockAiDraft[] = [
  {
    id: "draft-1",
    case_id: "c-enriched",
    tenant_name: "Meridian VI",
    kind: "guidance",
    body: "We identified and blocked an outbound connection from [HOST_1] to a known malicious IP. The affected workstation has been isolated. We recommend resetting credentials for any users who recently logged into that machine.",
    tenant_preview: "We identified and blocked a suspicious connection from one of your devices. The device has been isolated. Please reset passwords for anyone who recently used it.",
    status: "pending_review",
    generated_at: new Date(Date.now() - 10 * 60_000).toISOString(),
    reviewed_by: null,
    reviewed_at: null,
    reject_reason: null,
    has_placeholder_defect: false,
  },
  {
    id: "draft-2",
    case_id: "c-placeholder-bug",
    tenant_name: "Meridian VI",
    kind: "guidance",
    body: "A failed login attempt pattern was observed from [HOST_1] against [HOST_1]. No further action is required.",
    tenant_preview: "A failed login attempt pattern was observed from [HOST_1] against [HOST_1]. No further action is required.",
    status: "pending_review",
    generated_at: new Date(Date.now() - 25 * 60_000).toISOString(),
    reviewed_by: null,
    reviewed_at: null,
    reject_reason: null,
    has_placeholder_defect: true,
  },
];

export function useMockAiDraftsQuery(status?: string) {
  return useQuery({
    queryKey: ["mock", "ai-drafts", status],
    queryFn: () => mockDelay(drafts.filter((d) => !status || d.status === status)),
  });
}

export function useMockAiDraftForCaseQuery(caseId: string | undefined) {
  return useQuery({
    queryKey: ["mock", "ai-draft-for-case", caseId],
    queryFn: () => mockDelay(drafts.find((d) => d.case_id === caseId) ?? null),
    enabled: Boolean(caseId),
  });
}

export function useMockApproveDraftMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reviewerEmail, body }: { id: string; reviewerEmail: string; body?: string }) => {
      drafts = drafts.map((d) =>
        d.id === id
          ? { ...d, status: "approved" as const, body: body ?? d.body, tenant_preview: body ?? d.tenant_preview, reviewed_by: reviewerEmail, reviewed_at: new Date().toISOString() }
          : d
      );
      return mockDelay(drafts.find((d) => d.id === id)!);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["mock", "ai-drafts"] }),
  });
}

export function useMockRejectDraftMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reviewerEmail, reason }: { id: string; reviewerEmail: string; reason: string }) => {
      drafts = drafts.map((d) =>
        d.id === id ? { ...d, status: "rejected" as const, reviewed_by: reviewerEmail, reviewed_at: new Date().toISOString(), reject_reason: reason } : d
      );
      return mockDelay(drafts.find((d) => d.id === id)!);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["mock", "ai-drafts"] }),
  });
}

import Link from "next/link";
import { AlertTriangle, Sparkles } from "lucide-react";
import { Can } from "@/components/auth/can";
import { MockDataBanner } from "@/components/shared/mock-data-banner";
import { TenantVisibleMark } from "@/components/shared/tenant-visible-mark";
import { Button } from "@/components/ui/button";
import { useMockAiDraftForCaseQuery } from "@/lib/mocks/ai";

// Card 10 — null means no panel at all. There's no real AI gateway, so
// every case not seeded into lib/mocks/ai.ts correctly shows
// not_generated — the honest default per the guide ("every screen must
// work with AI switched off"), not a placeholder for missing wiring.
export function AiPanel({ caseId }: { caseId: string }) {
  const { data: draft, isLoading } = useMockAiDraftForCaseQuery(caseId);
  if (isLoading) return null;

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="flex items-center gap-2 font-heading font-bold">
        <Sparkles className="size-4 text-ocean" aria-hidden="true" />
        AI assistance
      </h2>

      {!draft || draft.status === "not_generated" ? (
        <p className="mt-2 text-sm text-muted-foreground">AI assistance wasn&rsquo;t available for this case. Nothing here affects how you work it.</p>
      ) : draft.status === "pending_review" ? (
        <div className="mt-3 flex flex-col gap-3">
          <p className="rounded-md bg-tone-amber-bg px-3 py-2 text-xs font-bold text-tone-amber-fg uppercase">
            AI draft — awaiting review, not visible to the tenant
          </p>
          <p className="text-sm whitespace-pre-wrap">{draft.body}</p>
          {draft.has_placeholder_defect && (
            <p className="flex items-start gap-1.5 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              A redaction placeholder survived into this draft — report to Backend. It can&rsquo;t be approved as-is.
            </p>
          )}
          <Can code="ai.review">
            <Button asChild size="sm" variant="outline" className="w-fit">
              <Link href="/ai-review">Review draft</Link>
            </Button>
          </Can>
        </div>
      ) : draft.status === "approved" ? (
        <div className="mt-3">
          <TenantVisibleMark label="Approved — this is what the tenant sees">
            <p className="text-sm whitespace-pre-wrap">{draft.tenant_preview}</p>
          </TenantVisibleMark>
          {draft.reviewed_by && <p className="mt-2 text-xs text-muted-foreground">Approved by {draft.reviewed_by}</p>}
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          <p className="text-sm text-muted-foreground">Rejected{draft.reviewed_by ? ` by ${draft.reviewed_by}` : ""}.</p>
          {draft.reject_reason && <p className="rounded-md bg-muted/60 px-3 py-2 text-sm">{draft.reject_reason}</p>}
        </div>
      )}

      <div className="mt-3">
        <MockDataBanner endpoint="GET /ai/drafts/:id" />
      </div>
    </section>
  );
}

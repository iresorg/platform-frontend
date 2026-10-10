"use client";

import { RequirePermission } from "@/components/auth/require-permission";

import { useState } from "react";
import { AlertTriangle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { MockDataBanner } from "@/components/shared/mock-data-banner";
import { TenantPreview, TenantVisibleMark } from "@/components/shared/tenant-visible-mark";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useMockAiDraftsQuery,
  useMockApproveDraftMutation,
  useMockRejectDraftMutation,
} from "@/lib/mocks/ai";
import { cn } from "cn";

function RejectRow({ onReject }: { onReject: (reason: string) => void }) {
  const [reason, setReason] = useState("");
  const [open, setOpen] = useState(false);
  if (!open) {
    return <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>Reject</Button>;
  }
  return (
    <div className="flex items-center gap-2">
      <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why reject?" rows={1} className="h-9 min-h-0 w-48" />
      <Button size="sm" variant="destructive" disabled={!reason.trim()} onClick={() => onReject(reason.trim())}>Confirm</Button>
    </div>
  );
}

export default function AiReviewPage() {
  const { user } = useAuth();
  const { data: drafts, isLoading } = useMockAiDraftsQuery("pending_review");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [edited, setEdited] = useState<string | null>(null);
  const approve = useMockApproveDraftMutation();
  const reject = useMockRejectDraftMutation();

  const selected = drafts?.find((d) => d.id === selectedId) ?? drafts?.[0] ?? null;
  const body = edited ?? selected?.body ?? "";
  const hasPlaceholderDefect = selected?.has_placeholder_defect && body.includes("[");

  async function doApprove() {
    if (!selected || !user) return;
    await approve.mutateAsync({ id: selected.id, reviewerEmail: user.email, body: edited ?? undefined });
    toast.success("Approved — now visible to the tenant.");
    setEdited(null);
    setSelectedId(null);
  }

  async function doReject(reason: string) {
    if (!selected || !user) return;
    await reject.mutateAsync({ id: selected.id, reviewerEmail: user.email, reason });
    toast.success("Rejected.");
    setSelectedId(null);
  }

  return (
    <RequirePermission code="ai.review">
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl">AI Review Queue</h1>
        <p className="text-sm text-muted-foreground">Drafts wait here until approved or rejected — nothing reaches a tenant on its own.</p>
      </div>

      <MockDataBanner endpoint="GET /ai/drafts" />

      {!isLoading && drafts?.length === 0 ? (
        <section className="rounded-xl border border-border bg-card shadow-sm">
          <EmptyState icon={Sparkles} title="Nothing pending review" description="Drafts will appear here as soon as they're generated." />
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[18rem_1fr]">
          <div className="flex flex-col gap-2">
            {drafts?.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => { setSelectedId(d.id); setEdited(null); }}
                className={cn(
                  "cursor-pointer rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                  (selected?.id ?? drafts[0]?.id) === d.id ? "border-ocean bg-tone-blue-bg/40" : "border-border hover:bg-muted"
                )}
              >
                <p className="font-medium">{d.tenant_name}</p>
                <p className="text-xs text-muted-foreground capitalize">{d.kind.replace("_", " ")}</p>
              </button>
            ))}
          </div>

          {selected && (
            <div className="flex flex-col gap-4">
              {hasPlaceholderDefect && (
                <p className="flex items-start gap-1.5 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  Placeholder not restored — report to Backend. This can&rsquo;t be approved as-is.
                </p>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="draft-editor">Edit draft</Label>
                  <Textarea id="draft-editor" rows={8} value={body} onChange={(e) => setEdited(e.target.value)} />
                </div>
                <TenantPreview title={`${selected.tenant_name} — ${selected.kind}`} body={body} />
              </div>
              <TenantVisibleMark label="Approving publishes this to the tenant immediately">
                <p className="text-xs text-muted-foreground">No optimistic update — this waits for the server before closing.</p>
              </TenantVisibleMark>
              <div className="flex items-center gap-2">
                <Button disabled={Boolean(hasPlaceholderDefect) || approve.isPending} onClick={() => void doApprove()}>
                  {approve.isPending ? "Approving..." : "Approve"}
                </Button>
                <RejectRow onReject={(r) => void doReject(r)} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
    </RequirePermission>
  );
}

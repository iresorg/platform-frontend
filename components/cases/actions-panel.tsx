"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { CaseTimeline } from "@/components/cases/case-timeline";
import { EscalateDialog } from "@/components/cases/escalate-dialog";
import { VerdictDialog } from "@/components/cases/verdict-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddCaseNoteMutation,
  useAssignCaseMutation,
  useCaseEventsQuery,
  useUpdateCaseStatusMutation,
} from "@/lib/cases/queries";
import type { Case, CaseStatus } from "@/lib/cases/types";

const EDITABLE_STATUSES: { value: CaseStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "investigating", label: "Investigating" },
];

export function ActionsPanel({ caseData }: { caseData: Case }) {
  const { user } = useAuth();
  const { data: events } = useCaseEventsQuery(caseData.id);
  const [note, setNote] = useState("");

  const statusMutation = useUpdateCaseStatusMutation();
  const assignMutation = useAssignCaseMutation();
  const addNoteMutation = useAddCaseNoteMutation();

  const isResolved = caseData.status === "resolved";
  const isAssignedToMe = caseData.assigned_analyst?.id === user?.id;

  function handleStatusChange(status: CaseStatus) {
    statusMutation.mutate(
      { id: caseData.id, status },
      { onError: () => toast.error("Failed to update status.") }
    );
  }

  function handleAssignToMe() {
    if (!user) return;
    assignMutation.mutate(
      { id: caseData.id, analyst: { id: user.id, name: user.name } },
      {
        onSuccess: () => toast.success("Case assigned to you."),
        onError: () => toast.error("Failed to assign case."),
      }
    );
  }

  function handleAddNote() {
    if (note.trim().length === 0) return;
    addNoteMutation.mutate(
      { id: caseData.id, note: note.trim() },
      {
        onSuccess: () => setNote(""),
        onError: () => toast.error("Failed to add note."),
      }
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h3 className="mb-3 text-xs font-bold tracking-wide text-muted-foreground uppercase">
          Case Actions
        </h3>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Status
            </span>
            <Select
              value={caseData.status}
              disabled={isResolved || statusMutation.isPending}
              onValueChange={(value) =>
                handleStatusChange(value as CaseStatus)
              }
            >
              <SelectTrigger size="sm" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EDITABLE_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
                {(caseData.status === "escalated" ||
                  caseData.status === "resolved") && (
                  <SelectItem value={caseData.status} disabled>
                    {caseData.status === "escalated"
                      ? "Escalated"
                      : "Resolved"}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              disabled={isResolved || isAssignedToMe || assignMutation.isPending}
              onClick={handleAssignToMe}
            >
              {isAssignedToMe ? "Assigned to you" : "Assign to me"}
            </Button>
            {isResolved ? (
              <Button variant="outline" disabled>
                Escalate
              </Button>
            ) : (
              <EscalateDialog caseId={caseData.id} />
            )}
          </div>

          {!isResolved && (
            <>
              <Separator />
              <VerdictDialog caseId={caseData.id} />
            </>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h3 className="mb-3 text-xs font-bold tracking-wide text-muted-foreground uppercase">
          Audit Timeline
        </h3>
        <CaseTimeline events={events ?? []} />

        {!isResolved && (
          <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Append an internal note to the audit log"
              rows={2}
            />
            <Button
              size="sm"
              variant="secondary"
              className="w-fit"
              disabled={note.trim().length === 0 || addNoteMutation.isPending}
              onClick={handleAddNote}
            >
              {addNoteMutation.isPending ? "Adding..." : "Append note"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

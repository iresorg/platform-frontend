"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEscalateCaseMutation } from "@/lib/incidents/queries";

// Escalate bumps the case to the next severity tier and marks it
// investigating — there's no separate "escalated" status on the backend.
export function EscalateDialog({
  caseId,
  open,
  onOpenChange,
}: {
  caseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [reason, setReason] = useState("");
  const mutation = useEscalateCaseMutation();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) return;
    try {
      await mutation.mutateAsync({ id: caseId, reason: reason.trim() });
      toast.success("Case escalated.");
      setReason("");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't escalate the case.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Escalate case</DialogTitle>
          <DialogDescription>Raises the severity a tier and marks it investigating. Say why.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="escalate-reason">Reason</Label>
            <Textarea
              id="escalate-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why this needs senior attention."
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!reason.trim() || mutation.isPending}>
              {mutation.isPending ? "Escalating..." : "Escalate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEscalateCaseMutation } from "@/lib/cases/queries";

export function EscalateDialog({ caseId }: { caseId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const escalateMutation = useEscalateCaseMutation();

  function handleSubmit() {
    escalateMutation.mutate(
      { id: caseId, reason: reason.trim() },
      {
        onSuccess: () => {
          toast.success("Case escalated to senior lead.");
          setOpen(false);
          setReason("");
        },
        onError: () => {
          toast.error("Failed to escalate case. Please try again.");
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="w-full">
          Escalate
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Escalate to senior lead</DialogTitle>
          <DialogDescription>
            This notifies the senior lead and marks the case as escalated.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="escalate-reason">Reason</Label>
          <Textarea
            id="escalate-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why does this case need senior lead attention?"
            rows={4}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={reason.trim().length === 0 || escalateMutation.isPending}
            onClick={handleSubmit}
          >
            {escalateMutation.isPending ? "Escalating..." : "Confirm escalation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

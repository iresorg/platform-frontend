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
import { useAuth } from "@/components/auth/auth-provider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCan } from "@/hooks/use-can";
import { useStaffQuery } from "@/lib/staff/queries";
import { Textarea } from "@/components/ui/textarea";
import { useEscalateCaseMutation } from "@/lib/incidents/queries";

// Escalate bumps the case to the next severity tier and marks it
// investigating — there's no separate "escalated" status on the backend.
// Naming someone also assigns the case to them and notifies them. Only an
// admin can list staff, so everyone else names them by email.
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
  const [escalatedTo, setEscalatedTo] = useState("");
  const mutation = useEscalateCaseMutation();
  const { user } = useAuth();
  const can = useCan();
  const canListStaff = can("user.manage");
  const { data: staff } = useStaffQuery(open && canListStaff);
  const seniors = staff?.filter((s) => s.is_active && s.tier !== "tier1" && s.id !== user?.id);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) return;
    try {
      const to = escalatedTo.trim() || undefined;
      await mutation.mutateAsync({ id: caseId, reason: reason.trim(), escalatedTo: to });
      toast.success(to ? "Case escalated and assigned." : "Case escalated.");
      setReason("");
      setEscalatedTo("");
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
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="escalate-to" id="escalate-to-label">Escalate to (optional)</Label>
            {canListStaff ? (
              <Select value={escalatedTo || "none"} onValueChange={(v) => setEscalatedTo(v === "none" ? "" : v)}>
                <SelectTrigger id="escalate-to" aria-labelledby="escalate-to-label" size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No one in particular</SelectItem>
                  {seniors?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name || s.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="escalate-to"
                type="email"
                value={escalatedTo}
                onChange={(e) => setEscalatedTo(e.target.value)}
                placeholder="analyst@iresorg.com"
              />
            )}
            <p className="text-xs text-muted-foreground">They&rsquo;re assigned the case and get a notification.</p>
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

"use client";

import { useState } from "react";
import { ArrowUpCircle, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { EscalateDialog } from "@/components/workspace/escalate-dialog";
import { VerdictDialog } from "@/components/workspace/verdict-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAssignCaseMutation, useChangeIncidentStatusMutation } from "@/lib/incidents/queries";
import type { Incident, IncidentStatus } from "@/lib/incidents/types";

export function ActionsCard({ incident }: { incident: Incident }) {
  const { user } = useAuth();
  const [verdictOpen, setVerdictOpen] = useState(false);
  const [escalateOpen, setEscalateOpen] = useState(false);
  const mutation = useChangeIncidentStatusMutation();
  const assignMutation = useAssignCaseMutation();
  const done = incident.status === "RESOLVED" || incident.status === "CLOSED";
  const assignedToMe = user?.email && incident.assigned_to_email === user.email;

  function changeStatus(status: IncidentStatus) {
    if (status === incident.status) return;
    mutation.mutate(
      { id: incident.id, payload: { status } },
      {
        onSuccess: () => toast.success(`Status set to ${status.toLowerCase()}.`),
        onError: (err) =>
          toast.error(`${err instanceof Error ? err.message : "Couldn't change the status"} — reverted to ${incident.status.toLowerCase()}.`),
      }
    );
  }

  function assignToMe() {
    assignMutation.mutate(
      { id: incident.id },
      {
        onSuccess: () => toast.success("Assigned to you."),
        onError: (err) => toast.error(err instanceof Error ? err.message : "Couldn't assign the case."),
      }
    );
  }

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="font-heading font-bold">Actions</h2>
      {done ? (
        <p className="mt-2 text-sm text-muted-foreground">This case is {incident.status.toLowerCase()}. Its verdict is recorded below.</p>
      ) : (
        <div className="mt-3 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label id="case-status-label">Status</Label>
            <Select value={incident.status} onValueChange={(v) => changeStatus(v as IncidentStatus)}>
              <SelectTrigger aria-labelledby="case-status-label" size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OPEN">Open</SelectItem>
                <SelectItem value="INVESTIGATING">Investigating</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={Boolean(assignedToMe) || assignMutation.isPending}
              onClick={assignToMe}
            >
              <UserPlus aria-hidden="true" />
              {assignedToMe ? "Assigned to you" : assignMutation.isPending ? "Assigning..." : "Assign to me"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setEscalateOpen(true)}>
              <ArrowUpCircle aria-hidden="true" />
              Escalate
            </Button>
          </div>
          <Button onClick={() => setVerdictOpen(true)}>Resolve case</Button>
        </div>
      )}
      <VerdictDialog caseId={incident.id} caseTitle={incident.title} open={verdictOpen} onOpenChange={setVerdictOpen} />
      <EscalateDialog caseId={incident.id} open={escalateOpen} onOpenChange={setEscalateOpen} />
    </section>
  );
}

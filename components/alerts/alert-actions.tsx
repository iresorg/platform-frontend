"use client";

import { useState } from "react";
import { CheckCircle2, Eye, PlayCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { EscalateDialog } from "@/components/alerts/escalate-dialog";
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
import { useTriageAlertMutation } from "@/lib/alerts/queries";
import { ruleLevelToIncidentSeverity } from "@/lib/alerts/severity";
import type { AlertDetail } from "@/lib/alerts/types";

interface TriageAction {
  status: string;
  label: string;
  title: string;
  description: string;
  done: string;
  notesRequired: boolean;
  icon: React.ElementType;
}

// One entry per status the backend reports for alerts. Resolve/dismiss
// close an alert out, so they require a note; the others don't.
const TRIAGE_ACTIONS: TriageAction[] = [
  {
    status: "ACKNOWLEDGED",
    label: "Acknowledge",
    title: "Acknowledge alert",
    description: "Lets the team know you've seen this and it's being looked at.",
    done: "Alert acknowledged.",
    notesRequired: false,
    icon: Eye,
  },
  {
    status: "IN_PROGRESS",
    label: "Start investigating",
    title: "Start investigating",
    description: "Marks the alert as actively being worked.",
    done: "Alert marked in progress.",
    notesRequired: false,
    icon: PlayCircle,
  },
  {
    status: "RESOLVED",
    label: "Resolve",
    title: "Resolve alert",
    description: "Record what you found and what was done.",
    done: "Alert resolved.",
    notesRequired: true,
    icon: CheckCircle2,
  },
  {
    status: "DISMISSED",
    label: "Dismiss",
    title: "Dismiss alert",
    description: "Use for false positives or expected activity. Say why.",
    done: "Alert dismissed.",
    notesRequired: true,
    icon: XCircle,
  },
];

function TriageActionDialog({
  alertId,
  action,
  onClose,
}: {
  alertId: string;
  action: TriageAction | null;
  onClose: () => void;
}) {
  const [notes, setNotes] = useState("");
  const mutation = useTriageAlertMutation();

  function close() {
    setNotes("");
    onClose();
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!action) return;
    try {
      await mutation.mutateAsync({
        id: alertId,
        payload: { status: action.status, notes: notes.trim() },
      });
      toast.success(action.done);
      close();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't update this alert.");
    }
  }

  return (
    <Dialog open={Boolean(action)} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{action?.title}</DialogTitle>
          <DialogDescription>{action?.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="triage-action-notes">
              Notes {action?.notesRequired ? "" : "(optional)"}
            </Label>
            <Textarea
              id="triage-action-notes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What you found and what you did."
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending || (action?.notesRequired && !notes.trim())}
            >
              {mutation.isPending ? "Saving..." : action?.label}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function stringField(obj: Record<string, unknown> | null, key: string): string | undefined {
  const value = obj?.[key];
  return typeof value === "string" && value ? value : undefined;
}

export function AlertActions({ alert }: { alert: AlertDetail }) {
  const [active, setActive] = useState<TriageAction | null>(null);
  const current = alert.status.toUpperCase();

  const contextTitle = stringField(alert.threat_context, "title");
  const contextFile = stringField(alert.threat_context, "file");
  const escalationDescription = [
    contextTitle ?? alert.rule_description,
    contextFile ? `File: ${contextFile}` : null,
    `Rule ${alert.rule_id} (level ${alert.rule_level}) on ${alert.agent_name} (${alert.agent_ip}).`,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Alert actions">
        {TRIAGE_ACTIONS.filter((a) => a.status !== current).map((a) => {
          const Icon = a.icon;
          return (
            <Button key={a.status} variant="outline" onClick={() => setActive(a)}>
              <Icon aria-hidden="true" />
              {a.label}
            </Button>
          );
        })}
        <EscalateDialog
          alertId={alert.id}
          defaultTitle={alert.rule_description}
          defaultSeverity={ruleLevelToIncidentSeverity(alert.rule_level)}
          defaultDescription={escalationDescription}
        />
      </div>
      <TriageActionDialog alertId={alert.id} action={active} onClose={() => setActive(null)} />
    </>
  );
}

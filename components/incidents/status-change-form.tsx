"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useChangeIncidentStatusMutation } from "@/lib/incidents/queries";
import type { IncidentStatus } from "@/lib/incidents/types";

const STATUS_OPTIONS: IncidentStatus[] = ["OPEN", "INVESTIGATING", "RESOLVED", "CLOSED"];

export function StatusChangeForm({
  incidentId,
  currentStatus,
}: {
  incidentId: string;
  currentStatus: IncidentStatus;
}) {
  const [status, setStatus] = useState<IncidentStatus>(currentStatus);
  const [resolutionSummary, setResolutionSummary] = useState("");
  const changeStatusMutation = useChangeIncidentStatusMutation();

  const requiresSummary = status === "RESOLVED" || status === "CLOSED";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (requiresSummary && !resolutionSummary.trim()) return;
    changeStatusMutation.mutate(
      {
        id: incidentId,
        payload: {
          status,
          ...(requiresSummary ? { resolution_summary: resolutionSummary.trim() } : {}),
        },
      },
      {
        onSuccess: () => toast.success("Status updated."),
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Failed to update status.");
        },
      }
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label id="status-change-label">Status</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as IncidentStatus)}>
          <SelectTrigger aria-labelledby="status-change-label" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {requiresSummary && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="resolution-summary">Resolution summary</Label>
          <Textarea
            id="resolution-summary"
            rows={3}
            placeholder="What happened and how it was resolved."
            value={resolutionSummary}
            onChange={(e) => setResolutionSummary(e.target.value)}
          />
        </div>
      )}

      <Button
        type="submit"
        size="sm"
        className="self-start"
        disabled={
          changeStatusMutation.isPending ||
          (requiresSummary && !resolutionSummary.trim())
        }
      >
        {changeStatusMutation.isPending ? "Updating..." : "Update status"}
      </Button>
    </form>
  );
}

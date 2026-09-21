"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
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
import { useTriageAlertMutation } from "@/lib/alerts/queries";

const triageSchema = z.object({
  status: z.string().min(1, "Select a status."),
  notes: z.string().trim().min(1, "Notes are required."),
});

type TriageFormValues = z.infer<typeof triageSchema>;

// Statuses confirmed from GET /alerts/stats/. Which of them the triage
// endpoint accepts as a target is unverified — the backend's validation
// error is surfaced in a toast if one is rejected.
const STATUS_OPTIONS = [
  { value: "ACKNOWLEDGED", label: "Acknowledged" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "DISMISSED", label: "Dismissed" },
];

export function TriagePanel({ alertId }: { alertId: string }) {
  const triageMutation = useTriageAlertMutation();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TriageFormValues>({
    resolver: zodResolver(triageSchema),
    defaultValues: { status: "ACKNOWLEDGED", notes: "" },
  });

  const status = useWatch({ control, name: "status" });

  function onSubmit(values: TriageFormValues) {
    triageMutation.mutate(
      { id: alertId, payload: values },
      {
        onSuccess: () => {
          toast.success("Triage submitted.");
          reset({ status: values.status, notes: "" });
        },
        onError: (err) => {
          toast.error(
            err instanceof Error ? err.message : "Failed to submit triage."
          );
        },
      }
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label id="triage-status-label">Status</Label>
        <Select
          value={status}
          onValueChange={(value) =>
            setValue("status", value, { shouldValidate: true })
          }
        >
          <SelectTrigger aria-labelledby="triage-status-label" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="triage-notes">Triage notes</Label>
        <Textarea
          id="triage-notes"
          rows={3}
          placeholder="What you found and what you did."
          aria-invalid={!!errors.notes}
          aria-describedby={errors.notes ? "triage-notes-error" : undefined}
          {...register("notes")}
        />
        {errors.notes && (
          <p id="triage-notes-error" className="text-xs text-destructive">
            {errors.notes.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="self-start">
        {isSubmitting ? "Submitting..." : "Submit triage"}
      </Button>
    </form>
  );
}

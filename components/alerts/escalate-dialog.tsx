"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useEscalateAlertMutation } from "@/lib/alerts/queries";
import type { IncidentSeverity } from "@/lib/alerts/types";

const escalateSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"], {
    required_error: "Select a severity.",
  }),
  description: z.string().trim().min(1, "Description is required."),
});

type EscalateFormValues = z.infer<typeof escalateSchema>;

const SEVERITY_OPTIONS: IncidentSeverity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export function EscalateDialog({
  alertId,
  defaultTitle,
  defaultSeverity = "MEDIUM",
  defaultDescription = "",
}: {
  alertId: string;
  defaultTitle: string;
  defaultSeverity?: IncidentSeverity;
  defaultDescription?: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const escalateMutation = useEscalateAlertMutation();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EscalateFormValues>({
    resolver: zodResolver(escalateSchema),
    defaultValues: {
      title: defaultTitle,
      severity: defaultSeverity,
      description: defaultDescription,
    },
  });

  const severity = useWatch({ control, name: "severity" });

  function onSubmit(values: EscalateFormValues) {
    escalateMutation.mutate(
      { id: alertId, payload: values },
      {
        onSuccess: (incident) => {
          toast.success(`Escalated to incident ${incident.id.slice(0, 8)}.`);
          setOpen(false);
          reset();
          router.push(`/cases/incidents/${incident.id}`);
        },
        onError: (err) => {
          toast.error(
            err instanceof Error
              ? err.message
              : "Failed to escalate this alert."
          );
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Escalate to incident</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Escalate to incident</DialogTitle>
          <DialogDescription>
            Creates a formal incident from this alert on the live backend.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="escalate-title">Title</Label>
            <Input
              id="escalate-title"
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "escalate-title-error" : undefined}
              {...register("title")}
            />
            {errors.title && (
              <p id="escalate-title-error" className="text-xs text-destructive">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label id="escalate-severity-label">Severity</Label>
            <Select
              value={severity}
              onValueChange={(value) =>
                setValue("severity", value as IncidentSeverity, {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger aria-labelledby="escalate-severity-label">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEVERITY_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="escalate-description">Description</Label>
            <Textarea
              id="escalate-description"
              rows={4}
              placeholder="Why this needs to become a formal incident."
              aria-invalid={!!errors.description}
              aria-describedby={
                errors.description ? "escalate-description-error" : undefined
              }
              {...register("description")}
            />
            {errors.description && (
              <p
                id="escalate-description-error"
                className="text-xs text-destructive"
              >
                {errors.description.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              {isSubmitting ? "Escalating..." : "Escalate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

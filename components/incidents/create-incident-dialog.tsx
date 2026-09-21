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
import { useCreateIncidentMutation } from "@/lib/incidents/queries";
import type { IncidentSeverity } from "@/lib/incidents/types";

const createSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  description: z.string().trim().min(1, "Description is required."),
  agent_id: z.string().trim().min(1, "Agent ID is required."),
  agent_name: z.string().trim().min(1, "Agent name is required."),
});

type CreateFormValues = z.infer<typeof createSchema>;

const SEVERITY_OPTIONS: IncidentSeverity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export function CreateIncidentDialog() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const createMutation = useCreateIncidentMutation();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { title: "", severity: "MEDIUM", description: "", agent_id: "", agent_name: "" },
  });

  const severity = useWatch({ control, name: "severity" });

  function onSubmit(values: CreateFormValues) {
    createMutation.mutate(
      { ...values, source_type: "MANUAL" },
      {
        onSuccess: (incident) => {
          toast.success("Incident created.");
          setOpen(false);
          reset();
          router.push(`/cases/incidents/${incident.id}`);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Failed to create incident.");
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New incident</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Open a manual incident</DialogTitle>
          <DialogDescription>
            For investigations that didn&rsquo;t start from an alert.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="incident-title">Title</Label>
            <Input id="incident-title" aria-invalid={!!errors.title} {...register("title")} />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label id="incident-severity-label">Severity</Label>
            <Select
              value={severity}
              onValueChange={(v) => setValue("severity", v as IncidentSeverity, { shouldValidate: true })}
            >
              <SelectTrigger aria-labelledby="incident-severity-label">
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

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="incident-agent-id">Agent ID</Label>
              <Input
                id="incident-agent-id"
                aria-invalid={!!errors.agent_id}
                {...register("agent_id")}
              />
              {errors.agent_id && (
                <p className="text-xs text-destructive">{errors.agent_id.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="incident-agent-name">Agent name</Label>
              <Input
                id="incident-agent-name"
                aria-invalid={!!errors.agent_name}
                {...register("agent_name")}
              />
              {errors.agent_name && (
                <p className="text-xs text-destructive">{errors.agent_name.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="incident-description">Description</Label>
            <Textarea
              id="incident-description"
              rows={4}
              aria-invalid={!!errors.description}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create incident"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

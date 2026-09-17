"use client";

import { useEffect, useState } from "react";
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitVerdictMutation } from "@/lib/cases/queries";
import type { VerdictClassification } from "@/lib/cases/types";

const verdictSchema = z.object({
  classification: z.enum(["true_positive", "false_positive", "benign"], {
    required_error: "Select a classification.",
  }),
  notes: z.string().trim().min(1, "Internal notes are required."),
  customer_guidance: z
    .string()
    .trim()
    .min(1, "Customer guidance is required."),
});

type VerdictFormValues = z.infer<typeof verdictSchema>;

const CLASSIFICATION_OPTIONS: {
  value: VerdictClassification;
  label: string;
}[] = [
  { value: "true_positive", label: "True positive" },
  { value: "false_positive", label: "False positive" },
  { value: "benign", label: "Benign" },
];

// Pre-fills customer guidance by classification — the analyst edits from
// here rather than writing from a blank field. This is the single biggest
// lever on portal output quality: most guidance ends up close to these.
const GUIDANCE_TEMPLATES: Record<VerdictClassification, string> = {
  true_positive:
    "We confirmed malicious activity related to this alert and have taken action to contain and remediate it. We recommend you reset credentials for any affected accounts and let us know if you notice anything unusual.",
  false_positive:
    "We investigated this alert and confirmed it was not malicious activity. No action is required on your part.",
  benign:
    "This alert was triggered by expected, authorized activity and does not indicate any security risk. No action is required.",
};

export function VerdictDialog({
  caseId,
  caseTitle,
}: {
  caseId: string;
  caseTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const submitVerdictMutation = useSubmitVerdictMutation();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<VerdictFormValues>({
    resolver: zodResolver(verdictSchema),
    defaultValues: { notes: "", customer_guidance: "" },
  });

  const classification = useWatch({ control, name: "classification" });
  const customerGuidance = useWatch({ control, name: "customer_guidance" });

  useEffect(() => {
    if (!classification) return;
    // setValue without shouldDirty leaves dirtyFields untouched, so this
    // only fills fields the analyst hasn't actually typed into yet.
    if (!dirtyFields.customer_guidance) {
      setValue("customer_guidance", GUIDANCE_TEMPLATES[classification], {
        shouldValidate: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classification]);

  function onSubmit(values: VerdictFormValues) {
    submitVerdictMutation.mutate(
      { id: caseId, verdict: values },
      {
        onSuccess: () => {
          toast.success("Verdict submitted. Case resolved.");
          setOpen(false);
          reset();
        },
        onError: () => {
          toast.error("Failed to submit verdict. Please try again.");
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Submit verdict &amp; close case</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Submit verdict</DialogTitle>
          <DialogDescription>
            This resolves the case and posts your guidance to the customer
            portal.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          <div className="flex flex-col gap-2">
            <Label id="classification-label">Classification</Label>
            <RadioGroup
              value={classification}
              aria-labelledby="classification-label"
              aria-describedby={
                errors.classification ? "classification-error" : undefined
              }
              onValueChange={(value) =>
                setValue("classification", value as VerdictClassification, {
                  shouldValidate: true,
                })
              }
            >
              {CLASSIFICATION_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center gap-2">
                  <RadioGroupItem
                    value={option.value}
                    id={`classification-${option.value}`}
                  />
                  <Label
                    htmlFor={`classification-${option.value}`}
                    className="font-normal"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {errors.classification && (
              <p id="classification-error" className="text-xs text-destructive">
                {errors.classification.message}
              </p>
            )}
            {classification && (
              <p className="text-xs text-muted-foreground">
                Customer guidance below was pre-filled for this
                classification — edit freely.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="verdict-notes">Internal notes</Label>
            <Textarea
              id="verdict-notes"
              rows={3}
              placeholder="SOC audit log — what happened, what was done."
              aria-invalid={!!errors.notes}
              aria-describedby={errors.notes ? "verdict-notes-error" : undefined}
              {...register("notes")}
            />
            {errors.notes && (
              <p id="verdict-notes-error" className="text-xs text-destructive">
                {errors.notes.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="verdict-guidance">Customer guidance</Label>
            <Textarea
              id="verdict-guidance"
              rows={4}
              placeholder="Plain-language advice visible in the customer portal."
              aria-invalid={!!errors.customer_guidance}
              aria-describedby={
                errors.customer_guidance ? "verdict-guidance-error" : undefined
              }
              {...register("customer_guidance")}
            />
            {errors.customer_guidance && (
              <p
                id="verdict-guidance-error"
                className="text-xs text-destructive"
              >
                {errors.customer_guidance.message}
              </p>
            )}
          </div>

          <div className="rounded-lg border border-dashed border-border bg-muted/40 p-3.5">
            <p className="mb-2 text-xs font-bold tracking-wide text-muted-foreground uppercase">
              What the client will see
            </p>
            <div className="rounded-lg border border-border bg-card p-3">
              <p className="text-sm font-medium">{caseTitle}</p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {customerGuidance || "Their guidance will appear here as you type."}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit verdict"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

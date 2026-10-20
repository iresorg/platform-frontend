"use client";

import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileJson, Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api-error";
import { useOnboardCustomerMutation } from "@/lib/customers/queries";
import type { AdminCustomerOnboardPayload } from "@/lib/customers/types";

const branchSchema = z.object({
  name: z.string().trim().min(1, "Required."),
  agent_group: z.string().trim().min(1, "Required."),
  expected_endpoints: z.coerce.number().int().min(0).optional(),
  code: z.string().trim().optional(),
});

const schema = z.object({
  customer_id: z.string().trim().min(1, "Required."),
  customer_name: z.string().trim().min(1, "Required."),
  sector: z.string().trim().optional(),
  service_tier: z.string().trim().optional(),
  is_test: z.boolean(),
  branches: z.array(branchSchema),
});

type Values = z.infer<typeof schema>;

// A parsed tenant.json's top-level shape — just enough to tell it apart
// from garbage before sending it on; the actual onboarding schema is
// enforced by the backend.
function looksLikeOnboardPayload(v: unknown): v is AdminCustomerOnboardPayload {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as Record<string, unknown>).customer_id === "string" &&
    typeof (v as Record<string, unknown>).customer_name === "string"
  );
}

export function OnboardCustomerDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const onboardMutation = useOnboardCustomerMutation();
  const [mode, setMode] = useState<"manual" | "file">("manual");
  const [fileBusy, setFileBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { customer_id: "", customer_name: "", sector: "", service_tier: "", is_test: false, branches: [] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "branches" });
  const isTest = watch("is_test");

  function closeAndReset() {
    onOpenChange(false);
    reset();
    setMode("manual");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function onManualSubmit(values: Values) {
    try {
      const result = await onboardMutation.mutateAsync({
        customer_id: values.customer_id,
        customer_name: values.customer_name,
        sector: values.sector || undefined,
        service_tier: values.service_tier || undefined,
        is_test: values.is_test,
        branches: values.branches.length ? values.branches : undefined,
      });
      const item = result.items[0];
      toast.success(
        item
          ? `${item.created ? "Onboarded" : "Updated"} ${item.customer_name} — ${item.branches_count} branch(es).`
          : "Onboarded."
      );
      closeAndReset();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't onboard that customer.");
    }
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileBusy(true);
    try {
      const text = await file.text();
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        toast.error("That file isn't valid JSON.");
        return;
      }
      const candidates = Array.isArray(parsed) ? parsed : [parsed];
      const payloads = candidates.filter(looksLikeOnboardPayload);
      if (payloads.length === 0) {
        toast.error("No valid customer entries found — each one needs at least customer_id and customer_name.");
        return;
      }

      let onboarded = 0;
      let failed = 0;
      for (const payload of payloads) {
        try {
          await onboardMutation.mutateAsync(payload);
          onboarded += 1;
        } catch {
          failed += 1;
        }
      }
      const skipped = candidates.length - payloads.length;
      if (onboarded > 0) {
        toast.success(
          `Onboarded ${onboarded} of ${candidates.length} customer(s).` +
            (failed ? ` ${failed} failed.` : "") +
            (skipped ? ` ${skipped} skipped (missing required fields).` : "")
        );
        closeAndReset();
      } else {
        toast.error("None of the entries in that file could be onboarded.");
      }
    } finally {
      setFileBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(o) : closeAndReset())}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Onboard customer</DialogTitle>
          <DialogDescription>
            Create a new client organization, either by uploading a <code>tenant.json</code> file or entering its
            details directly.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <Button type="button" size="sm" variant={mode === "manual" ? "default" : "outline"} onClick={() => setMode("manual")}>
            Enter manually
          </Button>
          <Button type="button" size="sm" variant={mode === "file" ? "default" : "outline"} onClick={() => setMode("file")}>
            Upload tenant.json
          </Button>
        </div>

        {mode === "file" ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border px-6 py-10 text-center">
            <FileJson className="size-8 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              Pick a <code>tenant.json</code> file. A file with several customers (a JSON array) onboards each one in
              turn.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={onFileChange}
              disabled={fileBusy}
              className="text-sm"
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onManualSubmit)} className="flex flex-col gap-4" noValidate>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="customer_id">Customer ID</Label>
                <Input id="customer_id" aria-invalid={!!errors.customer_id} {...register("customer_id")} />
                {errors.customer_id && <p className="text-xs text-destructive">{errors.customer_id.message}</p>}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="customer_name">Customer name</Label>
                <Input id="customer_name" aria-invalid={!!errors.customer_name} {...register("customer_name")} />
                {errors.customer_name && <p className="text-xs text-destructive">{errors.customer_name.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sector">Sector</Label>
                <Input id="sector" placeholder="Optional" {...register("sector")} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="service_tier">Service tier</Label>
                <Input id="service_tier" placeholder="standard" {...register("service_tier")} />
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              variant={isTest ? "default" : "outline"}
              className="w-fit"
              aria-pressed={isTest}
              onClick={() => setValue("is_test", !isTest)}
            >
              Test organization
            </Button>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label>Branches</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => append({ name: "", agent_group: "", expected_endpoints: 0, code: "" })}
                >
                  <Plus className="size-3.5" aria-hidden="true" />
                  Add branch
                </Button>
              </div>
              {fields.length === 0 && <p className="text-xs text-muted-foreground">No branches added — optional.</p>}
              {fields.map((field, i) => (
                <div key={field.id} className="flex items-start gap-2 rounded-md border border-border p-2">
                  <div className="grid flex-1 grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor={`branches.${i}.name`} className="text-xs text-muted-foreground">
                        Branch name
                      </Label>
                      <Input id={`branches.${i}.name`} {...register(`branches.${i}.name`)} />
                      {errors.branches?.[i]?.name && (
                        <p className="text-xs text-destructive">{errors.branches[i]?.name?.message}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor={`branches.${i}.agent_group`} className="text-xs text-muted-foreground">
                        Agent group
                      </Label>
                      <Input id={`branches.${i}.agent_group`} {...register(`branches.${i}.agent_group`)} />
                      {errors.branches?.[i]?.agent_group && (
                        <p className="text-xs text-destructive">{errors.branches[i]?.agent_group?.message}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor={`branches.${i}.expected_endpoints`} className="text-xs text-muted-foreground">
                        Expected endpoints
                      </Label>
                      <Input
                        id={`branches.${i}.expected_endpoints`}
                        type="number"
                        min={0}
                        {...register(`branches.${i}.expected_endpoints`)}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor={`branches.${i}.code`} className="text-xs text-muted-foreground">
                        Code
                      </Label>
                      <Input id={`branches.${i}.code`} placeholder="Optional" {...register(`branches.${i}.code`)} />
                    </div>
                  </div>
                  <Button type="button" size="icon" variant="ghost" className="mt-5" onClick={() => remove(i)} aria-label="Remove branch">
                    <Trash2 className="size-3.5" aria-hidden="true" />
                  </Button>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeAndReset}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Onboarding…" : "Onboard customer"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

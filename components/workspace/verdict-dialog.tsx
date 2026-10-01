"use client";

import { useState } from "react";
import { Eye, Lock } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useResolveCaseMutation } from "@/lib/incidents/queries";
import type { CaseVerdict } from "@/lib/incidents/types";

type Classification = "true_positive" | "false_positive" | "benign";

const OPTIONS: { value: Classification; label: string }[] = [
  { value: "true_positive", label: "True positive" },
  { value: "false_positive", label: "False positive" },
  { value: "benign", label: "Benign" },
];

const TO_BACKEND_VERDICT: Record<Classification, CaseVerdict> = {
  true_positive: "TRUE_POSITIVE",
  false_positive: "FALSE_POSITIVE",
  benign: "BENIGN",
};

// Pre-fills the customer text so the analyst edits rather than writes from
// a blank field — the biggest lever on portal quality.
const GUIDANCE_TEMPLATES: Record<Classification, string> = {
  true_positive:
    "We confirmed malicious activity related to this alert and have taken action to contain and remediate it. Please reset credentials for any affected accounts and let us know if you notice anything unusual.",
  false_positive:
    "We investigated this alert and confirmed it was not malicious activity. No action is required on your part.",
  benign:
    "This alert was triggered by expected, authorized activity and does not indicate any security risk. No action is required.",
};

export function VerdictDialog({
  caseId,
  caseTitle,
  open,
  onOpenChange,
}: {
  caseId: string;
  caseTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [classification, setClassification] = useState<Classification | "">("");
  const [notes, setNotes] = useState("");
  const [guidance, setGuidance] = useState("");
  const [guidanceEdited, setGuidanceEdited] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mutation = useResolveCaseMutation();

  const valid = classification !== "" && notes.trim() !== "" && guidance.trim() !== "";

  function pick(value: Classification) {
    setClassification(value);
    if (!guidanceEdited) setGuidance(GUIDANCE_TEMPLATES[value]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || !classification) return;
    setError(null);
    try {
      await mutation.mutateAsync({
        id: caseId,
        verdict: TO_BACKEND_VERDICT[classification],
        internalNotes: notes.trim(),
        customerGuidance: guidance.trim(),
      });
      toast.success("Case resolved. The guidance is now visible to the customer.");
      onOpenChange(false);
    } catch (err) {
      // Keep the modal open with everything they typed.
      setError(err instanceof Error ? err.message : "Couldn't resolve the case.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Resolve case</DialogTitle>
          <DialogDescription>Record your verdict. This closes the case and posts your guidance to the customer portal.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label id="verdict-class-label">Classification</Label>
            <RadioGroup value={classification} onValueChange={(v) => pick(v as Classification)} aria-labelledby="verdict-class-label" className="flex flex-wrap gap-x-5 gap-y-2">
              {OPTIONS.map((o) => (
                <div key={o.value} className="flex items-center gap-2">
                  <RadioGroupItem value={o.value} id={`verdict-${o.value}`} />
                  <Label htmlFor={`verdict-${o.value}`} className="font-normal">{o.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-muted/40 p-3">
            <Label htmlFor="verdict-notes" className="flex items-center gap-1.5">
              <Lock className="size-3.5" aria-hidden="true" />
              Internal notes
              <span className="font-normal text-muted-foreground">— analysts only, never shown to the customer</span>
            </Label>
            <Textarea id="verdict-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What happened, what was done. Shorthand is fine here." />
          </div>

          <div className="flex flex-col gap-1.5 rounded-lg border-2 border-ocean/50 bg-tone-blue-bg/30 p-3">
            <Label htmlFor="verdict-guidance" className="flex items-center gap-1.5 font-bold text-tone-blue-fg">
              <Eye className="size-4" aria-hidden="true" />
              This text is shown to the customer
            </Label>
            <Textarea
              id="verdict-guidance"
              rows={4}
              value={guidance}
              onChange={(e) => {
                setGuidance(e.target.value);
                setGuidanceEdited(true);
              }}
              placeholder="Plain-language advice for their IT team. No jargon, no internal shorthand."
              className="bg-card"
            />
            {classification && !guidanceEdited && (
              <p className="text-xs text-muted-foreground">Pre-filled for this classification — edit freely.</p>
            )}
          </div>

          <div className="rounded-lg border border-dashed border-border p-3">
            <p className="mb-2 text-xs font-bold tracking-wide text-muted-foreground uppercase">How it will look in the portal</p>
            <div className="rounded-lg border border-border bg-card p-3">
              <p className="text-sm font-medium">{caseTitle}</p>
              <p className="mt-1.5 text-sm whitespace-pre-wrap text-muted-foreground">{guidance || "Their guidance will appear here as you type."}</p>
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error} Nothing you typed was lost.
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={!valid || mutation.isPending}>
              {mutation.isPending ? "Resolving..." : "Resolve case"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAddIncidentNoteMutation } from "@/lib/incidents/queries";

// The note lands in the timeline the moment the server confirms it — no
// page refresh, no waiting for the next poll.
export function NoteComposer({ caseId, disabled }: { caseId: string; disabled?: boolean }) {
  const [content, setContent] = useState("");
  const mutation = useAddIncidentNoteMutation();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = content.trim();
    if (!text) return;
    mutation.mutate(
      { id: caseId, payload: { content: text } },
      {
        onSuccess: () => setContent(""),
        onError: (err) => toast.error(err instanceof Error ? err.message : "Couldn't add the note."),
      }
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <Label htmlFor="case-note">Add note</Label>
      <Textarea id="case-note" rows={3} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Internal note — visible to analysts only." disabled={disabled} />
      <Button type="submit" size="sm" className="self-end" disabled={disabled || mutation.isPending || !content.trim()}>
        {mutation.isPending ? "Posting..." : "Post"}
      </Button>
    </form>
  );
}

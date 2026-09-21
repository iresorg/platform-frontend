"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAddIncidentNoteMutation } from "@/lib/incidents/queries";
import type { IncidentNote } from "@/lib/incidents/types";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function IncidentNotes({
  incidentId,
  notes,
}: {
  incidentId: string;
  notes: IncidentNote[];
}) {
  const [content, setContent] = useState("");
  const addNoteMutation = useAddIncidentNoteMutation();

  const sorted = [...notes].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    addNoteMutation.mutate(
      { id: incidentId, payload: { content: trimmed } },
      {
        onSuccess: () => setContent(""),
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Failed to add note.");
        },
      }
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground">No notes yet.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {sorted.map((note) => (
            <li key={note.id} className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-sm">{note.content}</p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {note.author_email} · {formatDateTime(note.created_at)}
              </p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <Textarea
          rows={2}
          placeholder="Add a note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Button
          type="submit"
          size="sm"
          className="self-start"
          disabled={addNoteMutation.isPending || !content.trim()}
        >
          {addNoteMutation.isPending ? "Adding..." : "Add note"}
        </Button>
      </form>
    </div>
  );
}

import type { PortalTimelineEntry } from "@/lib/portal/types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

// The backend types a timeline entry as a free-form object with no fixed
// schema, so field names are read defensively rather than assumed. A
// resolved test case came back with an empty array, so the exact shape
// for a populated one hasn't been confirmed — ask the backend for a real
// example if this ever renders oddly.
function entryMessage(entry: PortalTimelineEntry): string {
  for (const key of ["message", "description", "content", "text", "summary"]) {
    const v = entry[key];
    if (typeof v === "string" && v.trim()) return v;
  }
  return "Update recorded.";
}

function entryDate(entry: PortalTimelineEntry): string | null {
  for (const key of ["created_at", "timestamp", "date", "occurred_at"]) {
    const v = entry[key];
    if (typeof v === "string" && v) return v;
  }
  return null;
}

function entryKey(entry: PortalTimelineEntry, index: number): string {
  const id = entry.id;
  return typeof id === "string" || typeof id === "number" ? String(id) : String(index);
}

// Plain steps with dates only — no internal event types, no analyst names.
export function CustomerTimeline({ entries }: { entries: PortalTimelineEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">No updates recorded yet.</p>;
  }
  return (
    <ol className="flex flex-col gap-4">
      {entries.map((e, i) => {
        const date = entryDate(e);
        return (
          <li key={entryKey(e, i)} className="relative flex gap-3">
            {i < entries.length - 1 && <span className="absolute top-4 bottom-[-1rem] left-[0.4rem] w-px bg-border" aria-hidden="true" />}
            <span className="relative z-10 mt-1 size-3 shrink-0 rounded-full border-2 border-ocean bg-card" aria-hidden="true" />
            <div>
              <p className="text-sm">{entryMessage(e)}</p>
              {date && <p className="text-xs text-muted-foreground">{formatDate(date)}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

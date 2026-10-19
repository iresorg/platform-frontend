import { FlaskConical } from "lucide-react";

// Every screen built against a mock data module (lib/mocks/*) shows this
// — the guide's golden rule is "only the Case API", so a screen reading
// from anywhere else must say so in the UI, not just in a code comment.
// See the backend asks list for what each one is waiting on.
export function MockDataBanner({ endpoint }: { endpoint: string }) {
  return (
    <div
      role="status"
      className="flex items-start gap-2 rounded-lg border border-dashed border-amber-brand/60 bg-tone-amber-bg/40 px-3 py-2 text-xs text-tone-amber-fg"
    >
      <FlaskConical className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
      <span>
        Demo data — the backend has no <code className="font-mono break-all">{endpoint}</code> yet. Layout and interactions are real; the numbers aren&rsquo;t.
      </span>
    </div>
  );
}

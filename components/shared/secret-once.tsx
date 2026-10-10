"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { CopyButton } from "@/components/shared/copy-button";

// Shows an install command or token exactly once (guide 2.3, A11 and P5).
// Never stored, logged or put in a URL by this component; it only ever
// holds what's passed in via props, and clears from the screen the moment
// the caller unmounts it (e.g. navigating away, or closing the dialog
// that owns it) — there is nothing here to clear from storage, because
// nothing here ever wrote to storage.
export function SecretOnce({ label, value }: { label: string; value: string }) {
  useEffect(() => {
    return () => {
      // Nothing persisted to clear — this effect exists so the intent is
      // visible in the code, and as a hook point if a caller ever needs
      // to know when the secret left the screen.
    };
  }, []);

  return (
    <div className="flex flex-col gap-2 rounded-lg border-2 border-dashed border-amber-brand/50 bg-tone-amber-bg/30 p-3">
      <p className="flex items-center gap-1.5 text-xs font-bold text-tone-amber-fg">
        <AlertTriangle className="size-3.5" aria-hidden="true" />
        Shown once — copy it now. It won&rsquo;t be shown again.
      </p>
      <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2">
        <code className="flex-1 overflow-x-auto font-mono text-xs break-all whitespace-pre-wrap">{value}</code>
        <CopyButton text={value} label={label} />
      </div>
    </div>
  );
}

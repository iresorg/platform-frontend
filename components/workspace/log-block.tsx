"use client";

import { useState } from "react";
import { CopyButton } from "@/components/shared/copy-button";
import { Button } from "@/components/ui/button";

// Evidence: read character by character, so never wrapped into
// unreadability. It scrolls sideways instead, and long entries collapse
// behind an expand control.
export function LogBlock({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const long = text.length > 240 || text.includes("\n");
  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <CopyButton text={text} label="log line" className="absolute top-1.5 right-1.5 bg-card" />
        <pre
          className={`overflow-x-auto rounded-lg border border-border bg-muted/50 p-3 pr-10 font-mono text-xs leading-relaxed whitespace-pre ${
            expanded || !long ? "" : "max-h-24 overflow-y-hidden"
          }`}
        >
          {text}
        </pre>
      </div>
      {long && (
        <Button variant="ghost" size="sm" className="self-start" onClick={() => setExpanded((v) => !v)}>
          {expanded ? "Collapse" : "Show full log"}
        </Button>
      )}
    </div>
  );
}

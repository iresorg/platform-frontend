"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CopyableBlock({
  text,
  label,
  maxHeightClass = "max-h-72",
}: {
  text: string;
  label: string;
  maxHeightClass?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't copy — select the text and copy it manually.");
    }
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="absolute top-2 right-2 bg-background"
        onClick={() => void copy()}
        aria-label={`Copy ${label}`}
      >
        {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        {copied ? "Copied" : "Copy"}
      </Button>
      <pre
        className={`${maxHeightClass} overflow-auto rounded-lg border border-border bg-muted/40 p-3 pr-24 font-mono text-xs leading-relaxed whitespace-pre-wrap break-all`}
      >
        {text}
      </pre>
    </div>
  );
}

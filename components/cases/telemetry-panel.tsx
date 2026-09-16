"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { OpenCtiCard } from "@/components/cases/opencti-card";
import { Button } from "@/components/ui/button";
import type { Case } from "@/lib/cases/types";

function CopyRawLogButton({ log }: { log: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(log);
    setCopied(true);
    toast.success("Raw log copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      {copied ? (
        <Check className="size-3.5" aria-hidden="true" />
      ) : (
        <Copy className="size-3.5" aria-hidden="true" />
      )}
      Copy raw log
    </Button>
  );
}

export function TelemetryPanel({ caseData }: { caseData: Case }) {
  const { raw_alert_ref, opencti_enrichment, summary } = caseData;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h3 className="mb-2 text-xs font-bold tracking-wide text-muted-foreground uppercase">
          Detection Summary
        </h3>
        <p className="text-sm">{summary}</p>
      </div>

      <OpenCtiCard enrichment={opencti_enrichment} />

      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-heading font-bold">Raw Alert</h3>
            <p className="text-xs text-muted-foreground">
              agent {raw_alert_ref.agent_id} · {raw_alert_ref.agent_name} ·
              rule {raw_alert_ref.rule_id}
            </p>
          </div>
          <CopyRawLogButton log={raw_alert_ref.full_log} />
        </div>
        <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs whitespace-pre-wrap text-foreground">
          {raw_alert_ref.full_log}
        </pre>
      </div>
    </div>
  );
}

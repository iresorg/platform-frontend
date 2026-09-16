"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { OpenCtiEnrichment } from "@/lib/cases/types";
import { cn } from "cn";

function classifyIndicator(value: string): string {
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(value)) return "IPv4";
  if (/^[a-f0-9]{64}$/i.test(value)) return "SHA256";
  if (/^[a-f0-9]{40}$/i.test(value)) return "SHA1";
  if (/^[a-f0-9]{32}$/i.test(value)) return "MD5";
  if (value.includes("\\") || value.includes("/")) return "Path";
  return "IOC";
}

function confidenceColor(confidence: number): string {
  if (confidence >= 80) return "bg-destructive";
  if (confidence >= 50) return "bg-amber-500";
  return "bg-blue-500";
}

function IndicatorRow({ indicator }: { indicator: string }) {
  const [copied, setCopied] = useState(false);
  const type = classifyIndicator(indicator);

  async function handleCopy() {
    await navigator.clipboard.writeText(indicator);
    setCopied(true);
    toast.success("Indicator copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <li className="flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-2">
      <span className="flex min-w-0 items-center gap-2 font-mono text-xs">
        <span className="shrink-0 rounded bg-background px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-muted-foreground uppercase">
          {type}
        </span>
        <span className="truncate">{indicator}</span>
      </span>
      <Button
        variant="outline"
        size="xs"
        onClick={handleCopy}
        aria-label={`Copy indicator ${indicator}`}
        className="shrink-0 font-sans"
      >
        {copied ? (
          <Check className="size-3" aria-hidden="true" />
        ) : (
          <Copy className="size-3" aria-hidden="true" />
        )}
        Copy
      </Button>
    </li>
  );
}

export function OpenCtiCard({
  enrichment,
}: {
  enrichment: OpenCtiEnrichment | null;
}) {
  if (!enrichment || !enrichment.is_enriched) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-1 flex items-center gap-2">
          <span
            className="size-1.5 rounded-full bg-muted-foreground"
            aria-hidden="true"
          />
          <h3 className="font-heading font-bold">OpenCTI Enrichment</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Not yet enriched by OpenCTI.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span
          className="size-1.5 rounded-full bg-brand-red"
          aria-hidden="true"
        />
        <h3 className="font-heading font-bold">OpenCTI Enrichment</h3>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {enrichment.malware_family && (
          <div>
            <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
              Malware family
            </p>
            <p className="mt-1 font-medium">{enrichment.malware_family}</p>
          </div>
        )}
        {enrichment.threat_actor && (
          <div>
            <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
              Threat actor
            </p>
            <p className="mt-1 font-medium">{enrichment.threat_actor}</p>
          </div>
        )}
        {enrichment.confidence !== undefined && (
          <div>
            <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
              Confidence
            </p>
            <div className="mt-2.5 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full",
                    confidenceColor(enrichment.confidence)
                  )}
                  style={{ width: `${enrichment.confidence}%` }}
                />
              </div>
              <span className="text-sm font-bold tabular-nums">
                {enrichment.confidence}
              </span>
            </div>
          </div>
        )}
      </div>

      {enrichment.indicators && enrichment.indicators.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-xs font-bold tracking-wide text-muted-foreground uppercase">
            Indicators of Compromise
          </p>
          <ul className="flex flex-col gap-1.5">
            {enrichment.indicators.map((indicator) => (
              <IndicatorRow key={indicator} indicator={indicator} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

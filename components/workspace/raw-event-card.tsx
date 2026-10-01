"use client";

import { useMemo, useState } from "react";
import { Braces, ChevronDown, ChevronRight } from "lucide-react";
import { CopyButton } from "@/components/shared/copy-button";
import { SkeletonCard } from "@/components/shared/skeletons";
import { Input } from "@/components/ui/input";
import { useIncidentRawQuery } from "@/lib/incidents/queries";
import type { JsonObject } from "@/lib/alerts/types";
import { cn } from "cn";

function isNonEmpty(v: unknown): v is JsonObject {
  return typeof v === "object" && v !== null && !Array.isArray(v) && Object.keys(v).length > 0;
}

type Tab = "fields" | "json";
const TAB_KEY = "ires:raw-event-tab";

function isObject(v: unknown): v is JsonObject {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

// { data: { win: { x: 1 } } } -> [["data.win.x", "1"]]. Arrays of scalars
// stay on one readable line; anything deeper keeps its dotted path per item.
export function flattenEvent(value: unknown, prefix = ""): [string, string][] {
  if (isObject(value)) {
    return Object.entries(value).flatMap(([k, v]) => flattenEvent(v, prefix ? `${prefix}.${k}` : k));
  }
  if (Array.isArray(value)) {
    if (value.every((v) => v === null || typeof v !== "object")) return [[prefix, value.map(String).join(", ")]];
    return value.flatMap((v, i) => flattenEvent(v, `${prefix}[${i}]`));
  }
  return [[prefix, value === null || value === undefined ? "" : String(value)]];
}

// Small tokenizer so the JSON tab reads at a glance; output is React nodes,
// never injected HTML, so log content can't become markup.
function HighlightedJson({ text }: { text: string }) {
  const parts = text.split(/("(?:\\.|[^"\\])*"(?:\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (i % 2 === 0) return p;
        const cls = p.startsWith('"')
          ? p.endsWith(":") ? "text-navy dark:text-sky" : "text-tone-green-fg"
          : /^(true|false|null)$/.test(p) ? "text-tone-orange-fg" : "text-ocean dark:text-sky";
        return <span key={i} className={cls}>{p}</span>;
      })}
    </>
  );
}

function readTab(): Tab {
  try { return localStorage.getItem(TAB_KEY) === "json" ? "json" : "fields"; } catch { return "fields"; }
}

function Viewer({ doc }: { doc: JsonObject }) {
  const [tab, setTab] = useState<Tab>(readTab);
  const [filter, setFilter] = useState("");
  const rows = useMemo(() => flattenEvent(doc), [doc]);
  const json = useMemo(() => JSON.stringify(doc, null, 2), [doc]);
  const shown = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return q ? rows.filter(([k, v]) => k.toLowerCase().includes(q) || v.toLowerCase().includes(q)) : rows;
  }, [rows, filter]);

  function pick(next: Tab) {
    setTab(next);
    try { localStorage.setItem(TAB_KEY, next); } catch { /* remembering the tab is a nicety */ }
  }

  return (
    <div className="mt-3 flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div role="tablist" aria-label="Event data view" className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5">
          {(["fields", "json"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              type="button"
              aria-selected={tab === t}
              onClick={() => pick(t)}
              className={cn(
                "cursor-pointer rounded-md px-3 py-1 text-sm font-medium transition-colors",
                tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t === "fields" ? "Fields" : "JSON"}
            </button>
          ))}
        </div>
        {tab === "fields" ? (
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter fields or values…"
            aria-label="Filter fields"
            className="h-8 max-w-xs"
          />
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            Copy all <CopyButton text={json} label="full event JSON" />
          </span>
        )}
      </div>

      {tab === "fields" ? (
        <div className="max-h-96 overflow-auto rounded-lg border border-border">
          {shown.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No fields match “{filter}”.</p>
          ) : (
            <table className="w-full text-left text-xs">
              <tbody>
                {shown.map(([path, value]) => (
                  <tr key={path} className="group border-b border-border last:border-0 hover:bg-row-hover">
                    <th scope="row" className="w-2/5 max-w-0 py-1.5 pr-2 pl-3 align-top font-mono font-medium break-all text-navy dark:text-sky">{path}</th>
                    <td className="py-1.5 pr-2 align-top font-mono break-all">{value === "" ? <span className="text-muted-foreground">—</span> : value}</td>
                    <td className="w-8 py-1 pr-2 align-top">
                      <CopyButton text={value} label={path} className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <pre className="max-h-96 overflow-auto rounded-lg border border-border bg-muted/50 p-3 font-mono text-xs leading-relaxed whitespace-pre">
          <HighlightedJson text={json} />
        </pre>
      )}
    </div>
  );
}

// Fetches only when the inline document came back empty (a manually
// created case, or an older record) — most cases already have
// Incident.raw_document, so this is a fallback path, not the default one.
function FetchedViewer({ caseId, enabled, fallback }: { caseId: string; enabled: boolean; fallback: JsonObject | null }) {
  const { data, isLoading, isError } = useIncidentRawQuery(caseId, enabled);
  if (isLoading) return <SkeletonCard className="mt-3 h-40" />;
  const doc = isNonEmpty(data) ? data : fallback;
  if (isError && !doc) {
    return <p className="mt-3 text-sm text-muted-foreground">The full event document isn&rsquo;t available for this case.</p>;
  }
  if (!doc) {
    return <p className="mt-3 text-sm text-muted-foreground">No raw document on file — this case wasn&rsquo;t generated from a Wazuh alert.</p>;
  }
  return <Viewer doc={doc} />;
}

// Replaces the Wazuh Dashboard drill-down. Analyst-only (this whole app is);
// the raw document contains hostnames, command lines and other internals.
// `inlineDocument` is Incident.raw_document — present on most cases, so the
// dedicated /raw/ endpoint below is only hit when that came back empty.
// `fallback` is the older raw_alert_ref-derived shape, kept as a last
// resort for cases predating the raw_document field.
export function RawEventCard({
  caseId,
  inlineDocument,
  fallback,
  multiple,
}: {
  caseId: string;
  inlineDocument: JsonObject | null | undefined;
  fallback: JsonObject | null;
  multiple: boolean;
}) {
  const [open, setOpen] = useState(false);
  const hasInline = isNonEmpty(inlineDocument);
  if (!hasInline && !fallback && !caseId) return null;
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center gap-2 text-left"
      >
        <Braces className="size-4 text-muted-foreground" aria-hidden="true" />
        <span className="font-heading font-bold">Full event data</span>
        {multiple && <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">Triggering event</span>}
        {open ? <ChevronDown className="ml-auto size-4" aria-hidden="true" /> : <ChevronRight className="ml-auto size-4" aria-hidden="true" />}
      </button>
      {open &&
        (hasInline ? (
          <Viewer doc={inlineDocument as JsonObject} />
        ) : (
          <FetchedViewer caseId={caseId} enabled={open} fallback={fallback} />
        ))}
    </section>
  );
}

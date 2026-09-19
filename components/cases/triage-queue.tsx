"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";
import { useAuth } from "@/components/auth/auth-provider";
import { EscalateDialog } from "@/components/cases/escalate-dialog";
import { RiskBadge } from "@/components/cases/risk-badge";
import { SeverityIndicator } from "@/components/cases/severity-indicator";
import { SlaBadge } from "@/components/cases/sla-badge";
import { StatusBadge } from "@/components/cases/status-badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNow } from "@/hooks/use-now";
import { useAssignCaseMutation, useCasesQuery } from "@/lib/cases/queries";
import type { Case, CaseStatus } from "@/lib/cases/types";

type SortKey = "severity" | "sla" | "risk";

// Fixed, sensible direction per key: soonest-due first for SLA,
// most-severe/highest-risk first for Severity/Risk.
const SORT_DIRECTION: Record<SortKey, "asc" | "desc"> = {
  sla: "asc",
  severity: "desc",
  risk: "desc",
};

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "sla", label: "SLA" },
  { key: "risk", label: "Risk" },
  { key: "severity", label: "Severity" },
];

const STATUS_OPTIONS: { value: CaseStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "new", label: "New" },
  { value: "investigating", label: "Investigating" },
  { value: "escalated", label: "Escalated" },
  { value: "resolved", label: "Resolved" },
];

const EDITABLE_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

function SortToggle({
  sortKey,
  onChange,
}: {
  sortKey: SortKey;
  onChange: (key: SortKey) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
        Sort by
      </span>
      <div className="inline-flex items-center rounded-lg border border-border bg-muted p-0.5">
        {SORT_OPTIONS.map((option) => {
          const active = sortKey === option.key;
          const Icon = SORT_DIRECTION[option.key] === "asc" ? ArrowUp : ArrowDown;
          return (
            <button
              key={option.key}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.key)}
              className={cn(
                "flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                active
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {option.label}
              {active && <Icon className="size-3" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TriageQueue() {
  const router = useRouter();
  const now = useNow();
  const { user } = useAuth();
  const { data: cases, isLoading } = useCasesQuery();
  const assignMutation = useAssignCaseMutation();

  const [status, setStatus] = useState<CaseStatus | "all">("all");
  const [customerId, setCustomerId] = useState<string>("all");
  const [severityMin, setSeverityMin] = useState("");
  const [severityMax, setSeverityMax] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("sla");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [escalateTarget, setEscalateTarget] = useState<Case | null>(null);

  const customers = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of cases ?? []) map.set(c.customer_id, c.customer_name);
    return Array.from(map.entries());
  }, [cases]);

  const filtered = useMemo(() => {
    if (!cases) return [];
    const min = severityMin === "" ? -Infinity : Number(severityMin);
    const max = severityMax === "" ? Infinity : Number(severityMax);
    return cases.filter((c) => {
      if (status !== "all" && c.status !== status) return false;
      if (customerId !== "all" && c.customer_id !== customerId) return false;
      if (c.severity < min || c.severity > max) return false;
      return true;
    });
  }, [cases, status, customerId, severityMin, severityMax]);

  const sorted = useMemo(() => {
    const direction = SORT_DIRECTION[sortKey];
    const copy = [...filtered];
    copy.sort((a, b) => {
      const diff =
        sortKey === "severity"
          ? a.severity - b.severity
          : sortKey === "risk"
            ? a.risk_score - b.risk_score
            : new Date(a.sla_due_at).getTime() -
              new Date(b.sla_due_at).getTime();
      return direction === "asc" ? diff : -diff;
    });
    return copy;
  }, [filtered, sortKey]);

  // Derived rather than synced via effect: clamps automatically when the
  // filtered/sorted list shrinks out from under the current selection.
  const clampedIndex =
    selectedIndex === null || sorted.length === 0
      ? null
      : Math.min(selectedIndex, sorted.length - 1);

  useEffect(() => {
    if (clampedIndex === null) return;
    document
      .querySelector(`[data-row-index="${clampedIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [clampedIndex]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const active = document.activeElement;
      if (
        active &&
        (EDITABLE_TAGS.has(active.tagName) ||
          (active as HTMLElement).isContentEditable)
      ) {
        return;
      }
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (sorted.length === 0) return;

      if (event.key === "j") {
        event.preventDefault();
        setSelectedIndex((i) =>
          i === null ? 0 : Math.min(i + 1, sorted.length - 1)
        );
        return;
      }
      if (event.key === "k") {
        event.preventDefault();
        setSelectedIndex((i) => (i === null ? 0 : Math.max(i - 1, 0)));
        return;
      }

      if (selectedIndex === null) return;
      const selected = sorted[selectedIndex];
      if (!selected) return;

      if (event.key === "Enter") {
        event.preventDefault();
        router.push(`/cases/${selected.id}`);
      } else if (event.key === "a") {
        event.preventDefault();
        if (!user) return;
        if (selected.assigned_analyst?.id === user.id) return;
        assignMutation.mutate(
          { id: selected.id, analyst: { id: user.id, name: user.name } },
          {
            onSuccess: () => toast.success(`Assigned "${selected.title}" to you.`),
            onError: () => toast.error("Failed to assign case."),
          }
        );
      } else if (event.key === "e") {
        event.preventDefault();
        if (selected.status === "resolved") return;
        setEscalateTarget(selected);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sorted, selectedIndex, user, assignMutation, router]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as CaseStatus | "all")}
          >
            <SelectTrigger size="sm" aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={customerId} onValueChange={setCustomerId}>
            <SelectTrigger size="sm" aria-label="Filter by customer">
              <SelectValue placeholder="All customers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All customers</SelectItem>
              {customers.map(([id, name]) => (
                <SelectItem key={id} value={id}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1.5">
            <Input
              placeholder="Min severity"
              value={severityMin}
              onChange={(e) => setSeverityMin(e.target.value)}
              type="number"
              className="h-7 w-28"
              aria-label="Minimum severity"
            />
            <span className="text-sm text-muted-foreground">–</span>
            <Input
              placeholder="Max severity"
              value={severityMax}
              onChange={(e) => setSeverityMax(e.target.value)}
              type="number"
              className="h-7 w-28"
              aria-label="Maximum severity"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <p className="hidden font-mono text-xs text-muted-foreground lg:block">
            <kbd className="rounded border border-border px-1">j</kbd>/
            <kbd className="rounded border border-border px-1">k</kbd> move ·{" "}
            <kbd className="rounded border border-border px-1">↵</kbd> open ·{" "}
            <kbd className="rounded border border-border px-1">a</kbd> assign ·{" "}
            <kbd className="rounded border border-border px-1">e</kbd> escalate
          </p>
          <SortToggle sortKey={sortKey} onChange={setSortKey} />
        </div>
      </div>

      <div
        className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
        aria-live="polite"
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10 bg-muted/50 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  #
                </TableHead>
                <TableHead className="bg-muted/50 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  Severity
                </TableHead>
                <TableHead className="bg-muted/50 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  Risk
                </TableHead>
                <TableHead className="bg-muted/50 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  SLA
                </TableHead>
                <TableHead className="bg-muted/50 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  Status
                </TableHead>
                <TableHead className="bg-muted/50 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  Case
                </TableHead>
                <TableHead className="bg-muted/50 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  Customer
                </TableHead>
                <TableHead className="bg-muted/50 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  Analyst
                </TableHead>
                <TableHead className="w-8 bg-muted/50" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={9} className="sr-only" role="status">
                    Loading cases…
                  </TableCell>
                </TableRow>
              )}
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} aria-hidden="true">
                    <TableCell colSpan={9}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  </TableRow>
                ))}

              {!isLoading && sorted.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="py-16 text-center text-muted-foreground"
                    role="status"
                  >
                    Zero active alerts pending triage.
                  </TableCell>
                </TableRow>
              )}

              {sorted.map((c, index) => (
                <TableRow
                  key={c.id}
                  data-row-index={index}
                  className={cn(
                    "cursor-pointer transition-colors hover:bg-muted/40",
                    index === clampedIndex &&
                      "bg-accent/60 ring-1 ring-inset ring-primary/50 hover:bg-accent/60"
                  )}
                  onClick={() => {
                    setSelectedIndex(index);
                    router.push(`/cases/${c.id}`);
                  }}
                >
                  <TableCell className="text-sm text-muted-foreground tabular-nums">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <SeverityIndicator severity={c.severity} />
                  </TableCell>
                  <TableCell>
                    <RiskBadge riskScore={c.risk_score} />
                  </TableCell>
                  <TableCell>
                    {c.status === "resolved" ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : (
                      <SlaBadge slaDueAt={c.sla_due_at} now={now} />
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={c.status} />
                  </TableCell>
                  <TableCell
                    className={cn("max-w-xs truncate font-medium")}
                    title={c.title}
                  >
                    <Link
                      href={`/cases/${c.id}`}
                      className="hover:underline focus-visible:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {c.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.customer_name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {c.assigned_analyst?.name ?? "Unassigned"}
                  </TableCell>
                  <TableCell>
                    <ChevronRight
                      className="size-4 text-muted-foreground/50"
                      aria-hidden="true"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {escalateTarget && (
        <EscalateDialog
          caseId={escalateTarget.id}
          caseTitle={escalateTarget.title}
          open={!!escalateTarget}
          onOpenChange={(open) => {
            if (!open) setEscalateTarget(null);
          }}
          showTrigger={false}
        />
      )}
    </div>
  );
}

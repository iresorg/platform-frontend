"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AlertActions } from "@/components/alerts/alert-actions";
import { AlertStatusBadge } from "@/components/alerts/alert-status-badge";
import { Chips } from "@/components/alerts/chips";
import { CopyableBlock } from "@/components/alerts/copyable-block";
import { KeyValueTree } from "@/components/alerts/key-value-tree";
import { RuleLevelBadge } from "@/components/alerts/rule-level-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlertQuery } from "@/lib/alerts/queries";
import { parseRawPayload } from "@/lib/alerts/raw-payload";
import type { JsonObject } from "@/lib/alerts/types";

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "medium",
  });
}

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="font-heading font-bold">{title}</h2>
      {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5">
      <span className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
        {label}
      </span>
      <span className="text-sm break-words">{value}</span>
    </div>
  );
}

const Mono = ({ children }: { children: React.ReactNode }) => (
  <span className="font-mono text-xs break-all">{children}</span>
);

const dash = <span className="text-muted-foreground">—</span>;

export default function LiveAlertDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: alert, isLoading, isError, error } = useAlertQuery(id);

  const raw = alert ? parseRawPayload(alert.raw_payload) : null;
  const context = alert?.threat_context ?? null;
  const contextTitle = typeof context?.title === "string" ? context.title : null;
  const contextRest: JsonObject | null = context
    ? Object.fromEntries(Object.entries(context).filter(([key]) => key !== "title"))
    : null;

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/cases/live-alerts"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to Live Alerts
      </Link>

      {isLoading && (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          Couldn&rsquo;t load this alert
          {error instanceof Error ? `: ${error.message}` : "."}
        </div>
      )}

      {alert && raw && (
        <>
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
            <div>
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <RuleLevelBadge level={alert.rule_level} />
                <AlertStatusBadge status={alert.status} />
              </div>
              <h1 className="font-heading text-xl font-bold">{alert.rule_description}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {alert.agent_name} ({alert.agent_ip}) · Detected {formatDateTime(alert.detected_at)}
              </p>
            </div>
            <AlertActions alert={alert} />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              {(contextTitle || (contextRest && Object.keys(contextRest).length > 0)) && (
                <Card title="What happened" description="Threat context reported with this alert.">
                  {contextTitle && (
                    <p className="mb-4 rounded-lg bg-muted/50 px-3 py-2.5 text-sm font-medium">
                      {contextTitle}
                    </p>
                  )}
                  {contextRest && Object.keys(contextRest).length > 0 && (
                    <KeyValueTree data={contextRest} />
                  )}
                </Card>
              )}

              {raw.fullLog && (
                <Card title="Full log" description="The original log line as Wazuh captured it.">
                  <CopyableBlock text={raw.fullLog} label="full log" />
                </Card>
              )}

              <Card title="Rule & compliance">
                <div className="divide-y divide-border">
                  <DetailRow label="Rule ID" value={<Mono>{alert.rule_id}</Mono>} />
                  <DetailRow label="Rule level" value={alert.rule_level} />
                  <DetailRow
                    label="Rule groups"
                    value={<Chips items={alert.rule_groups ?? []} />}
                  />
                  {raw.firedTimes !== undefined && (
                    <DetailRow label="Times fired" value={raw.firedTimes} />
                  )}
                  {raw.mailAlert !== undefined && (
                    <DetailRow label="Email alert" value={raw.mailAlert ? "Yes" : "No"} />
                  )}
                  {raw.frameworks.map((f) => (
                    <DetailRow key={f.label} label={f.label} value={<Chips items={f.values} />} />
                  ))}
                </div>
              </Card>
            </div>

            <div className="flex flex-col gap-4">
              <Card title="Agent">
                <div className="divide-y divide-border">
                  <DetailRow label="Name" value={alert.agent_name} />
                  <DetailRow label="Agent ID" value={<Mono>{alert.agent_id}</Mono>} />
                  <DetailRow label="IP address" value={<Mono>{alert.agent_ip}</Mono>} />
                  {raw.agentGroup && <DetailRow label="Group" value={<Mono>{raw.agentGroup}</Mono>} />}
                  {raw.manager && <DetailRow label="Manager" value={<Mono>{raw.manager}</Mono>} />}
                  {raw.decoder && <DetailRow label="Decoder" value={<Mono>{raw.decoder}</Mono>} />}
                  {raw.location && <DetailRow label="Log source" value={<Mono>{raw.location}</Mono>} />}
                  {raw.inputType && <DetailRow label="Input type" value={<Mono>{raw.inputType}</Mono>} />}
                </div>
              </Card>

              <Card title="Alert details">
                <div className="divide-y divide-border">
                  <DetailRow label="Alert ID" value={<Mono>{alert.id}</Mono>} />
                  <DetailRow label="External ID" value={<Mono>{alert.external_id}</Mono>} />
                  <DetailRow label="Status" value={<AlertStatusBadge status={alert.status} />} />
                  <DetailRow label="Detected" value={formatDateTime(alert.detected_at)} />
                  <DetailRow label="Ingested" value={formatDateTime(alert.created_at)} />
                  <DetailRow label="Last updated" value={formatDateTime(alert.updated_at)} />
                </div>
              </Card>

              <Card title="Triage" description="Who has handled this alert, and what they said.">
                <div className="divide-y divide-border">
                  <DetailRow
                    label="Notes"
                    value={
                      alert.triage_notes ? (
                        <span className="whitespace-pre-wrap">{alert.triage_notes}</span>
                      ) : (
                        <span className="text-muted-foreground">Not triaged yet.</span>
                      )
                    }
                  />
                  <DetailRow label="Triaged by" value={alert.triaged_by_email || dash} />
                  <DetailRow label="Triaged at" value={formatDateTime(alert.triaged_at)} />
                </div>
              </Card>
            </div>
          </div>

          {alert.raw_payload && (
            <details className="group rounded-xl border border-border bg-card shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 select-none">
                <span>
                  <span className="font-heading font-bold">Raw payload</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    Everything Wazuh sent, unmodified
                  </span>
                </span>
                <span className="text-xs text-muted-foreground group-open:hidden">Show</span>
                <span className="hidden text-xs text-muted-foreground group-open:inline">Hide</span>
              </summary>
              <div className="border-t border-border p-5">
                <CopyableBlock
                  text={JSON.stringify(alert.raw_payload, null, 2)}
                  label="raw payload"
                  maxHeightClass="max-h-[32rem]"
                />
              </div>
            </details>
          )}
        </>
      )}
    </div>
  );
}

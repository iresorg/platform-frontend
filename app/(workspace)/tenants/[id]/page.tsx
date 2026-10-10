"use client";

import { RequirePermission } from "@/components/auth/require-permission";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Laptop, Monitor } from "lucide-react";
import { toast } from "sonner";
import { SecretOnce } from "@/components/shared/secret-once";
import { MockDataBanner } from "@/components/shared/mock-data-banner";
import { SkeletonCard } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import { ColorBadge } from "@/components/ui/color-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RelativeTime } from "@/components/shared/relative-time";
import {
  useMockCreateTokenMutation,
  useMockEnrolmentTokensQuery,
  useMockRevokeTokenMutation,
} from "@/lib/mocks/enrolment";
import { useMockConnectorQuery, useMockTenantScopeQuery } from "@/lib/mocks/tenant-extras";
import { useTenantQuery } from "@/lib/tenants/queries";
import { useCan } from "@/hooks/use-can";
import { cn } from "cn";

type Tab = "overview" | "scope" | "enrolment" | "connectors";

function OverviewTab({ tenantId }: { tenantId: string }) {
  const { data: tenant, isLoading } = useTenantQuery(tenantId);
  if (isLoading) return <SkeletonCard className="h-32" />;
  if (!tenant) return null;
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[
          ["Name", tenant.name],
          ["Slug", tenant.slug],
          ["Status", tenant.status ?? "Active"],
          ["Created", tenant.created_at ? new Date(tenant.created_at).toLocaleDateString(undefined, { dateStyle: "medium" }) : "—"],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs font-bold tracking-wide text-muted-foreground uppercase">{label}</dt>
            <dd className="mt-0.5 text-sm">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function ScopeTab({ tenantId }: { tenantId: string }) {
  const { data: scope, isLoading } = useMockTenantScopeQuery(tenantId);
  if (isLoading) return <SkeletonCard className="h-40" />;
  if (!scope) return null;
  return (
    <section className="flex flex-col gap-3">
      <MockDataBanner endpoint="GET/PUT /tenants/:id/scope" />
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <p className="mb-3 text-xs font-bold tracking-wide text-muted-foreground uppercase">Rules of engagement</p>
        <ul className="flex flex-col gap-2">
          {scope.items.map((item, i) => (
            <li key={i} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm">
              <span className="capitalize text-muted-foreground">{item.type.replace("_", " ")}</span>
              <span className="text-right">{item.value}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">Signed by {scope.signed_by} on {scope.signed_date}</p>
      </div>
    </section>
  );
}

function EnrolmentTab() {
  const { data: tokens, isLoading } = useMockEnrolmentTokensQuery();
  const revoke = useMockRevokeTokenMutation();
  const createMutation = useMockCreateTokenMutation();
  const [createOpen, setCreateOpen] = useState(false);
  const [command, setCommand] = useState<string | null>(null);

  async function create() {
    const res = await createMutation.mutateAsync({ label: "Staff-issued token", os: "windows", cap: 10 });
    setCommand(res.command);
  }

  return (
    <section className="flex flex-col gap-3">
      <MockDataBanner endpoint="GET/POST /tenants/:id/enrolment-tokens" />
      <div className="flex justify-end">
        <Button size="sm" onClick={() => { setCreateOpen(true); setCommand(null); }}>Create token</Button>
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col divide-y divide-border">
          {isLoading && <p className="p-5 text-sm text-muted-foreground">Loading...</p>}
          {tokens?.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="flex items-center gap-3">
                <Monitor className="size-4 text-muted-foreground" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.used} of {t.device_cap} used · expires <RelativeTime iso={t.expires_at} /></p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ColorBadge tone={t.status === "active" ? "emerald" : t.status === "expired" ? "slate" : "red"} variant="outline">{t.status}</ColorBadge>
                {t.status === "active" && (
                  <Button variant="ghost" size="sm" onClick={() => revoke.mutate(t.id, { onSuccess: () => toast.success("Revoked.") })}>Revoke</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create enrolment token</DialogTitle>
            <DialogDescription>Windows install command, single machine.</DialogDescription>
          </DialogHeader>
          {command ? (
            <SecretOnce label="install command" value={command} />
          ) : (
            <p className="text-sm text-muted-foreground">Creating a 10-device Windows token for this tenant.</p>
          )}
          <DialogFooter>
            {command ? (
              <Button onClick={() => setCreateOpen(false)}>Done</Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button disabled={createMutation.isPending} onClick={() => void create()}>
                  {createMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function ConnectorsTab({ tenantId }: { tenantId: string }) {
  const { data: connector, isLoading } = useMockConnectorQuery(tenantId);
  if (isLoading) return <SkeletonCard className="h-32" />;
  if (!connector) return null;
  const silent = connector.status === "silent";
  return (
    <section className="flex flex-col gap-3">
      <MockDataBanner endpoint="GET /tenants/:id/connectors" />
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-heading font-bold capitalize">{connector.mode} connector</p>
            <p className="text-sm text-muted-foreground">Last heartbeat <RelativeTime iso={connector.last_heartbeat} /></p>
          </div>
          <ColorBadge tone={silent ? "red" : "emerald"}>{silent ? "Silent" : "Connected"}</ColorBadge>
        </div>
        {silent && (
          <p className="mt-3 rounded-md bg-tone-amber-bg px-3 py-2 text-sm text-tone-amber-fg">
            No heartbeat for longer than the expected {connector.expected_heartbeat_seconds}s window.
          </p>
        )}
      </div>
    </section>
  );
}

export default function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const can = useCan();
  const [tab, setTab] = useState<Tab>("overview");

  const tabs: { id: Tab; label: string; show: boolean }[] = [
    { id: "overview", label: "Overview", show: true },
    { id: "scope", label: "Scope", show: true },
    { id: "enrolment", label: "Enrolment", show: can("tenant.tokens") },
    { id: "connectors", label: "Connectors", show: true },
  ];

  return (
    <RequirePermission code="tenant.read">
    <div className="flex flex-col gap-4">
      <Button asChild variant="outline" size="sm" className="w-fit">
        <Link href="/tenants"><ArrowLeft aria-hidden="true" /> All tenants</Link>
      </Button>

      <div className="flex items-center gap-2">
        <Laptop className="size-5 text-muted-foreground" aria-hidden="true" />
        <h1 className="text-xl">Tenant detail</h1>
      </div>

      <div role="tablist" aria-label="Tenant sections" className="inline-flex w-fit rounded-lg border border-border bg-muted/50 p-0.5">
        {tabs.filter((t) => t.show).map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "cursor-pointer rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors",
              tab === t.id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab tenantId={id} />}
      {tab === "scope" && <ScopeTab tenantId={id} />}
      {tab === "enrolment" && can("tenant.tokens") && <EnrolmentTab />}
      {tab === "connectors" && <ConnectorsTab tenantId={id} />}
    </div>
    </RequirePermission>
  );
}

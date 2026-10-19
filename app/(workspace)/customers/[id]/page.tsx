"use client";

import { RequirePermission } from "@/components/auth/require-permission";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Laptop, MonitorCheck, ShieldAlert, UserPlus, Users as UsersIcon } from "lucide-react";
import { toast } from "sonner";
import { ClientContacts } from "@/components/workspace/client-contacts";
import { EmptyState } from "@/components/shared/empty-state";
import { RelativeTime } from "@/components/shared/relative-time";
import { SecretOnce } from "@/components/shared/secret-once";
import { SkeletonCard } from "@/components/shared/skeletons";
import { TestBadge } from "@/components/shared/test-badge";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCan } from "@/hooks/use-can";
import {
  useCreateCustomerUserMutation,
  useCustomerEndpointsQuery,
  useCustomerOnboardingQuery,
  useCustomerQuery,
  useCustomerUsersQuery,
  useDisableCustomerUserMutation,
} from "@/lib/customers/queries";
import type { AdminCreateUserResponse, AdminCustomerUser } from "@/lib/customers/types";

const HEAD = "bg-muted/60 text-xs font-bold tracking-wide text-muted-foreground uppercase";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="mb-3 font-heading font-bold">{title}</h2>
      {children}
    </section>
  );
}

function ContactsCard({ customerId }: { customerId: string }) {
  return (
    <Card title="Contacts">
      <ClientContacts customerId={customerId} bare />
    </Card>
  );
}

function OnboardingCard({ customerId }: { customerId: string }) {
  const { data, isLoading } = useCustomerOnboardingQuery(customerId);
  if (isLoading) return <SkeletonCard className="h-40" />;
  if (!data) return null;
  return (
    <Card title="Onboarding progress">
      <div className="flex flex-col gap-4">
        {data.branches.map((b) => {
          const hasExpected = b.expected_endpoints > 0;
          const pct = hasExpected ? Math.min(100, Math.round((b.active / b.expected_endpoints) * 100)) : 0;
          return (
            <div key={b.branch_label} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{b.branch_label}</span>
                <span className="text-muted-foreground tabular-nums">
                  {hasExpected ? `${b.active} of ${b.expected_endpoints} active` : `${b.active} active`}
                </span>
              </div>
              {hasExpected && (
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-emerald-brand" style={{ width: `${pct}%` }} />
                </div>
              )}
            </div>
          );
        })}
        {data.branches.length === 0 && <p className="text-sm text-muted-foreground">No branches set up yet.</p>}

        {data.pending_endpoints.length > 0 && (
          <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
            <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">Enrolled, not reporting yet</p>
            {data.pending_endpoints.map((d) => (
              <div key={d.agent_id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm">
                <span className="flex items-center gap-2">
                  <Laptop className="size-4 text-muted-foreground" aria-hidden="true" />
                  {d.name}
                  {d.os_name && <span className="text-xs text-muted-foreground">{d.os_name}</span>}
                </span>
                {d.date_add && <span className="text-xs text-muted-foreground">enrolled <RelativeTime iso={d.date_add} /></span>}
              </div>
            ))}
            <p className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
              <ShieldAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
              No heartbeat after about 10 minutes? Check outbound internet access, proxy settings and that its clock is correct.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

function EndpointsCard({ customerId }: { customerId: string }) {
  const { data, isLoading } = useCustomerEndpointsQuery(customerId);
  return (
    <Card title="Endpoints">
      {isLoading ? (
        <SkeletonCard className="h-32" />
      ) : !data || data.length === 0 ? (
        <EmptyState icon={MonitorCheck} title="No machines enrolled yet" description="Share the client's installer to begin." />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className={HEAD}>Name</TableHead>
                <TableHead className={HEAD}>Branch</TableHead>
                <TableHead className={HEAD}>Status</TableHead>
                <TableHead className={HEAD}>Last seen</TableHead>
                <TableHead className={HEAD}>OS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((ep, i) => (
                <TableRow key={`${ep.name}-${i}`}>
                  <TableCell className="font-medium">{ep.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{ep.branch_label || "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{ep.status}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {ep.last_seen ? <RelativeTime iso={ep.last_seen} /> : "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{ep.os || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}

function InviteUserDialog({ customerId, open, onOpenChange }: { customerId: string; open: boolean; onOpenChange: (o: boolean) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<AdminCreateUserResponse | null>(null);
  const invite = useCreateCustomerUserMutation(customerId);

  async function submit() {
    if (!name.trim() || !email.trim()) return;
    try {
      const res = await invite.mutateAsync({ name: name.trim(), email: email.trim() });
      setResult(res);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't send the invite.");
    }
  }

  function close() {
    setName("");
    setEmail("");
    setResult(null);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(o) : close())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite a portal user</DialogTitle>
          <DialogDescription>They&rsquo;ll get a link that expires in 72 hours.</DialogDescription>
        </DialogHeader>
        {!result ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-name">Name</Label>
              <Input id="invite-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="invite-email">Email</Label>
              <Input id="invite-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@client.com" />
            </div>
          </div>
        ) : (
          <SecretOnce label="invite link" value={result.invite_url} />
        )}
        <DialogFooter>
          {!result ? (
            <>
              <Button type="button" variant="outline" onClick={close}>Cancel</Button>
              <Button type="button" disabled={!name.trim() || !email.trim() || invite.isPending} onClick={() => void submit()}>
                {invite.isPending ? "Sending..." : "Send invite"}
              </Button>
            </>
          ) : (
            <Button type="button" onClick={close}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DisableUserDialog({
  customerId,
  user,
  onOpenChange,
}: {
  customerId: string;
  user: AdminCustomerUser | null;
  onOpenChange: (o: boolean) => void;
}) {
  const disable = useDisableCustomerUserMutation(customerId);

  async function confirm() {
    if (!user) return;
    try {
      await disable.mutateAsync(user.id);
      toast.success(`${user.name} disabled.`);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't disable this user.");
    }
  }

  return (
    <Dialog open={Boolean(user)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Disable {user?.name}?</DialogTitle>
          <DialogDescription>This immediately revokes all their sessions and portal access.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" variant="destructive" disabled={disable.isPending} onClick={() => void confirm()}>
            {disable.isPending ? "Disabling..." : "Disable"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const STATUS_TONE: Record<AdminCustomerUser["status"], "blue" | "emerald" | "slate"> = {
  invited: "blue",
  active: "emerald",
  disabled: "slate",
};

function PortalUsersCard({ customerId, canManage }: { customerId: string; canManage: boolean }) {
  const { data, isLoading } = useCustomerUsersQuery(customerId);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [disableTarget, setDisableTarget] = useState<AdminCustomerUser | null>(null);

  return (
    <Card title="Portal users">
      <div className="mb-3 flex justify-end">
        {canManage && (
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <UserPlus aria-hidden="true" /> Invite user
          </Button>
        )}
      </div>
      {isLoading ? (
        <SkeletonCard className="h-24" />
      ) : !data || data.length === 0 ? (
        <EmptyState icon={UsersIcon} title="No portal users yet" />
      ) : (
        <div className="flex flex-col divide-y divide-border">
          {data.map((u) => (
            <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div>
                <p className="text-sm font-medium">{u.name}</p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {u.invited_date && (
                  <span className="text-xs text-muted-foreground">
                    invited <RelativeTime iso={u.invited_date} />
                  </span>
                )}
                <ColorBadge tone={STATUS_TONE[u.status]} variant="outline">{u.status}</ColorBadge>
                {canManage && u.status !== "disabled" && (
                  <Button variant="ghost" size="sm" onClick={() => setDisableTarget(u)}>Disable</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {canManage && (
        <>
          <InviteUserDialog customerId={customerId} open={inviteOpen} onOpenChange={setInviteOpen} />
          <DisableUserDialog customerId={customerId} user={disableTarget} onOpenChange={(o) => !o && setDisableTarget(null)} />
        </>
      )}
    </Card>
  );
}

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const can = useCan();
  const { data: customer, isLoading } = useCustomerQuery(id);
  // "Lead only" in the addendum — see lib/auth/permissions.ts for the
  // admin-tier mapping and why.
  const canManage = can("customer.manage");

  return (
    <RequirePermission code="customer.read">
    <div className="flex flex-col gap-4">
      <Link href="/customers" className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" />
        All customers
      </Link>

      {isLoading ? (
        <SkeletonCard className="h-24" />
      ) : customer ? (
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-xl font-bold">{customer.name}</h1>
            {customer.is_test && <TestBadge />}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {customer.sector} · {customer.service_tier}
          </p>
        </section>
      ) : null}

      <OnboardingCard customerId={id} />
      <EndpointsCard customerId={id} />
      <ContactsCard customerId={id} />
      <PortalUsersCard customerId={id} canManage={canManage} />
    </div>
    </RequirePermission>
  );
}

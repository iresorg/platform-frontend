"use client";

import { RequirePermission } from "@/components/auth/require-permission";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Laptop, Monitor, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { MockDataBanner } from "@/components/shared/mock-data-banner";
import { SecretOnce } from "@/components/shared/secret-once";
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
import { RelativeTime } from "@/components/shared/relative-time";
import {
  mockSimulateEnrolment,
  useMockCreateTokenMutation,
  useMockEnrolmentTokensQuery,
  useMockPendingDevicesQuery,
  useMockRevokeTokenMutation,
  type MockEnrolmentToken,
} from "@/lib/mocks/enrolment";
import { cn } from "cn";

const OS_OPTIONS: { value: MockEnrolmentToken["os"]; label: string }[] = [
  { value: "windows", label: "Windows" },
  { value: "macos", label: "macOS" },
  { value: "linux", label: "Linux" },
];

function CreateTokenDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [os, setOs] = useState<MockEnrolmentToken["os"]>("windows");
  const [label, setLabel] = useState("");
  const [cap, setCap] = useState(10);
  const [result, setResult] = useState<{ command: string } | null>(null);
  const mutation = useMockCreateTokenMutation();

  async function create() {
    const res = await mutation.mutateAsync({ label: label || `${os} enrolment`, os, cap });
    setResult({ command: res.command });
    mockSimulateEnrolment(`New ${os} device`);
  }

  function close() {
    setResult(null);
    setLabel("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(o) : close())}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a device</DialogTitle>
          <DialogDescription>Choose an operating system and create a one-time install command.</DialogDescription>
        </DialogHeader>
        {!result ? (
          <div className="flex flex-col gap-4">
            <div role="group" aria-label="Operating system" className="flex gap-2">
              {OS_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  aria-pressed={os === o.value}
                  onClick={() => setOs(o.value)}
                  className={cn(
                    "flex-1 cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                    os === o.value ? "border-ocean bg-tone-blue-bg/50 text-tone-blue-fg" : "border-border hover:bg-muted"
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="device-label">Label (optional)</Label>
              <Input id="device-label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Office laptops" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="device-cap">Device limit</Label>
              <Input id="device-cap" type="number" min={1} max={100} value={cap} onChange={(e) => setCap(Number(e.target.value))} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">Run this on the machine to enrol it. It won&rsquo;t be shown again.</p>
            <SecretOnce label="install command" value={result.command} />
          </div>
        )}
        <DialogFooter>
          {!result ? (
            <>
              <Button type="button" variant="outline" onClick={close}>Cancel</Button>
              <Button type="button" disabled={mutation.isPending} onClick={() => void create()}>
                {mutation.isPending ? "Creating..." : "Create token"}
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

export default function AddDevicesPage() {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const { data: tokens, isLoading } = useMockEnrolmentTokensQuery();
  const { data: pending } = useMockPendingDevicesQuery(true);
  const revoke = useMockRevokeTokenMutation();

  return (
    <RequirePermission code="portal.devices.enrol">
    <div className="flex flex-col gap-4">
      <Button asChild variant="outline" size="sm" className="w-fit">
        <button type="button" onClick={() => router.push("/portal/devices")}>
          <ArrowLeft aria-hidden="true" /> All devices
        </button>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl">Add devices</h1>
          <p className="text-sm text-muted-foreground">Create an install command to enrol a new computer or server.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>Add a device</Button>
      </div>

      <MockDataBanner endpoint="POST /portal/enrolment-tokens" />

      {pending && pending.length > 0 && (
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-3 text-xs font-bold tracking-wide text-muted-foreground uppercase">Enrolling now</h2>
          <div className="flex flex-col gap-2">
            {pending.map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
                <span className="flex items-center gap-2 text-sm">
                  <Laptop className="size-4 text-muted-foreground" aria-hidden="true" />
                  {d.display_name}
                </span>
                <ColorBadge tone={d.status === "active" ? "emerald" : "amber"} pulse={d.status === "pending"}>
                  {d.status === "active" ? "Online" : "Pending"}
                </ColorBadge>
              </div>
            ))}
          </div>
          <p className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
            <ShieldAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            No heartbeat after about 10 minutes? Check the device allows outbound internet access, any proxy settings, and that its clock is correct.
          </p>
        </section>
      )}

      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-heading font-bold">Install tokens</h2>
          <p className="text-sm text-muted-foreground">Past tokens and their usage. Revoking stops a token from enrolling any new device.</p>
        </div>
        <div className="flex flex-col divide-y divide-border">
          {isLoading && <p className="p-5 text-sm text-muted-foreground">Loading...</p>}
          {tokens?.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="flex items-center gap-3">
                <Monitor className="size-4 text-muted-foreground" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium">{t.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.used} of {t.device_cap} used · expires <RelativeTime iso={t.expires_at} />
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ColorBadge tone={t.status === "active" ? "emerald" : t.status === "expired" ? "slate" : "red"} variant="outline">
                  {t.status}
                </ColorBadge>
                {t.status === "active" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      revoke.mutate(t.id, { onSuccess: () => toast.success("Token revoked.") });
                    }}
                  >
                    Revoke
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <CreateTokenDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
    </RequirePermission>
  );
}

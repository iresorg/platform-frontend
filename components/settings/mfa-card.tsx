"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { CopyButton } from "@/components/shared/copy-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
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
import { ColorBadge } from "@/components/ui/color-badge";
import { mfaConfirm, mfaDisable, mfaSetup } from "@/lib/auth/real-api";
import type { MfaSetupData } from "@/lib/auth/real-types";
import { getMe } from "@/lib/tenants/api";

type Step = { kind: "idle" } | { kind: "setup"; data: MfaSetupData } | { kind: "codes"; codes: string[] };

// No QR code yet: the setup key is shown for manual entry, which every
// authenticator app supports ("Enter a setup key").
export function MfaCard() {
  const queryClient = useQueryClient();
  const { data: me, isLoading } = useQuery({ queryKey: ["me"], queryFn: () => getMe(), retry: false });
  const [step, setStep] = useState<Step>({ kind: "idle" });
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disableOpen, setDisableOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [disableCode, setDisableCode] = useState("");

  const enabled = me?.user.mfa_enabled ?? false;
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["me"] });

  async function start() {
    setBusy(true);
    setError(null);
    try {
      setStep({ kind: "setup", data: await mfaSetup() });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't start setup.");
    } finally {
      setBusy(false);
    }
  }

  async function confirm(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await mfaConfirm(code.trim());
      setStep({ kind: "codes", codes: res.recovery_codes });
      setCode("");
      void refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That code didn't work.");
    } finally {
      setBusy(false);
    }
  }

  async function disable(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await mfaDisable(password, disableCode.trim());
      toast.success("Two-step verification turned off.");
      setDisableOpen(false);
      setPassword("");
      setDisableCode("");
      void refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't turn it off.");
    } finally {
      setBusy(false);
    }
  }

  if (isLoading) return <Skeleton className="h-16 w-full" />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        {enabled ? <ShieldCheck className="size-5 text-tone-green-fg" aria-hidden="true" /> : <ShieldOff className="size-5 text-muted-foreground" aria-hidden="true" />}
        <p className="text-sm font-medium">Two-step verification</p>
        <ColorBadge tone={enabled ? "emerald" : "slate"} variant="outline">{enabled ? "On" : "Off"}</ColorBadge>
      </div>

      {step.kind === "idle" && !enabled && (
        <>
          <p className="text-sm text-muted-foreground">Ask for a code from an authenticator app when you sign in, so a stolen password alone isn&rsquo;t enough.</p>
          <Button className="w-fit" onClick={() => void start()} disabled={busy}>{busy ? "Starting..." : "Turn on"}</Button>
        </>
      )}

      {step.kind === "setup" && (
        <form onSubmit={confirm} className="flex max-w-md flex-col gap-3">
          <p className="text-sm text-muted-foreground">In your authenticator app choose <b>Enter a setup key</b>, type this key, then enter the 6-digit code it shows.</p>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2">
            <code className="flex-1 font-mono text-sm break-all">{step.data.secret}</code>
            <CopyButton text={step.data.secret} label="setup key" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mfa-confirm">6-digit code</Label>
            <Input id="mfa-confirm" value={code} onChange={(e) => setCode(e.target.value)} autoComplete="one-time-code" className="font-mono tracking-widest" />
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" disabled={busy || !code.trim()}>{busy ? "Checking..." : "Turn on"}</Button>
            <Button type="button" variant="outline" onClick={() => { setStep({ kind: "idle" }); setError(null); }}>Cancel</Button>
          </div>
        </form>
      )}

      {step.kind === "codes" && (
        <div className="flex max-w-md flex-col gap-3 rounded-lg border-2 border-tone-amber-line bg-tone-amber-bg/40 p-4">
          <p className="text-sm font-bold">Save your recovery codes now</p>
          <p className="text-sm text-muted-foreground">Each works once if you lose your authenticator. They&rsquo;re shown only this one time.</p>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-sm">
            {step.codes.map((c) => <li key={c}>{c}</li>)}
          </ul>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => { void navigator.clipboard.writeText(step.codes.join("\n")).then(() => toast.success("Recovery codes copied.")); }}>Copy all</Button>
            <Button size="sm" onClick={() => setStep({ kind: "idle" })}>I&rsquo;ve saved them</Button>
          </div>
        </div>
      )}

      {enabled && step.kind === "idle" && (
        <Button variant="destructive" className="w-fit" onClick={() => { setError(null); setDisableOpen(true); }}>Turn off</Button>
      )}

      <Dialog open={disableOpen} onOpenChange={setDisableOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Turn off two-step verification</DialogTitle>
            <DialogDescription>Confirm with your password and a current code from your authenticator.</DialogDescription>
          </DialogHeader>
          <form onSubmit={disable} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mfa-off-password">Password</Label>
              <Input id="mfa-off-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mfa-off-code">Code</Label>
              <Input id="mfa-off-code" value={disableCode} onChange={(e) => setDisableCode(e.target.value)} autoComplete="one-time-code" className="font-mono tracking-widest" />
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDisableOpen(false)}>Cancel</Button>
              <Button type="submit" variant="destructive" disabled={busy || !password || !disableCode.trim()}>{busy ? "Turning off..." : "Turn off"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

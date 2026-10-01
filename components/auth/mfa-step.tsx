"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { authButtonClass, authInputClass, authLabelClass } from "@/components/auth/auth-split-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api-error";
import type { AuthUser } from "@/lib/auth/types";

// Second step of sign-in for accounts with MFA. The same field accepts a
// 6-digit authenticator code or a one-time recovery code.
export function MfaStep({
  challengeToken,
  onSuccess,
  onBack,
}: {
  challengeToken: string;
  onSuccess: (user: AuthUser) => void;
  onBack: () => void;
}) {
  const { completeMfa } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    setError(null);
    try {
      onSuccess(await completeMfa(challengeToken, code));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        <span className="flex size-10 items-center justify-center rounded-full bg-cool-tint text-navy dark:bg-brand-tint dark:text-brand-soft">
          <ShieldCheck className="size-5" aria-hidden="true" />
        </span>
        <span className="mt-1 text-xs font-bold tracking-[0.12em] text-ires-red uppercase">Two-step verification</span>
        <h1 className="font-sans text-4xl font-extrabold tracking-tight text-heading">Enter your code</h1>
        <p className="text-sm text-muted-foreground">From your authenticator app, or one of your recovery codes.</p>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-5" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="mfa-code" className={authLabelClass}>Code</Label>
          <Input
            id="mfa-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            autoComplete="one-time-code"
            autoFocus
            className={`${authInputClass} font-mono tracking-widest`}
            aria-invalid={Boolean(error)}
          />
        </div>
        {error && (
          <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
        )}
        <Button type="submit" size="lg" className={authButtonClass} disabled={busy || !code.trim()}>
          {busy ? "Verifying..." : "Verify"}
        </Button>
      </form>
      <button type="button" onClick={onBack} className="cursor-pointer text-center text-sm text-muted-foreground hover:text-foreground">
        Back to sign in
      </button>
    </>
  );
}

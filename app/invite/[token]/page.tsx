"use client";

import { use, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { useTenantSwitch } from "@/components/tenants/use-tenant-switch";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { roleHome } from "@/lib/auth/roles";
import { useAcceptInvitationMutation } from "@/lib/tenants/queries";
import type { Member } from "@/lib/tenants/types";

export default function AcceptInvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const { user, isLoading } = useAuth();
  const accept = useAcceptInvitationMutation();
  const { switchTo, isSwitching } = useTenantSwitch();
  const [joined, setJoined] = useState<Member | null>(null);
  const [error, setError] = useState<string | null>(null);
  const from = encodeURIComponent(`/invite/${token}`);

  async function handleAccept() {
    setError(null);
    try {
      setJoined(await accept.mutateAsync({ token, payload: { token } }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't accept this invitation.");
    }
  }

  return (
    <AuthSplitLayout
      headline="You've been invited to join a team."
      description="Accept the invitation to get access to your organization's alerts, incidents and team."
    >
      <div className="flex flex-col gap-1.5">
        <h2 className="text-3xl">Join organization</h2>
        <p className="text-sm text-muted-foreground">Invitation links are single-use and expire.</p>
      </div>

      {isLoading ? (
        <Skeleton className="h-24 w-full rounded-xl" />
      ) : joined ? (
        <div className="flex flex-col gap-4">
          <p role="status" className="flex items-start gap-2 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            You&rsquo;ve joined {joined.tenant.name}.
          </p>
          <Button
            size="lg"
            className="h-11"
            disabled={isSwitching}
            onClick={async () => {
              await switchTo(joined.tenant.id);
            }}
          >
            Switch to {joined.tenant.name}
          </Button>
          <Button asChild variant="outline" size="lg" className="h-11">
            <Link href={user ? roleHome(user.role) : "/login"}>Stay in current organization</Link>
          </Button>
        </div>
      ) : user ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            You&rsquo;re signed in as <span className="font-medium text-foreground">{user.email}</span>.
          </p>
          {error && (
            <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <Button size="lg" className="h-11" disabled={accept.isPending} onClick={() => void handleAccept()}>
            {accept.isPending ? "Joining..." : "Accept invitation"}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">Sign in with the account this invitation was sent to.</p>
          <Button asChild size="lg" className="h-11">
            <Link href={`/login?from=${from}`}>Sign in to accept</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-11">
            <Link href="/register">Create an account</Link>
          </Button>
        </div>
      )}
    </AuthSplitLayout>
  );
}

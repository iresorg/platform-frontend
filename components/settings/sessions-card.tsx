"use client";

import { LogOut, Monitor } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { ColorBadge } from "@/components/ui/color-badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useLogoutAllMutation,
  useRevokeSessionMutation,
  useSessionsQuery,
} from "@/lib/auth/real-queries";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function SessionsCard() {
  const { user, logout } = useAuth();
  const { data: sessions, isLoading, isError, error } = useSessionsQuery();
  const revoke = useRevokeSessionMutation();
  const logoutAll = useLogoutAllMutation();

  const sorted = [...(sessions ?? [])].sort(
    (a, b) => new Date(b.last_seen_at).getTime() - new Date(a.last_seen_at).getTime()
  );

  async function handleRevoke(id: string) {
    try {
      const res = await revoke.mutateAsync(id);
      toast.success(res.message);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't revoke that session.");
    }
  }

  async function handleLogoutAll() {
    try {
      await logoutAll.mutateAsync();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't sign out everywhere.");
      return;
    }
    logout();
  }

  return (
    <div className="flex flex-col gap-4">
      {isLoading && <Skeleton className="h-16 w-full rounded-lg" />}
      {isError && (
        <p className="text-sm text-destructive">
          Couldn&rsquo;t load sessions{error instanceof Error ? `: ${error.message}` : "."}
        </p>
      )}
      <ul className="flex flex-col gap-2">
        {sorted.map((session) => {
          const isCurrent = session.id === user?.session_id;
          return (
            <li
              key={session.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3"
            >
              <div className="flex min-w-0 items-start gap-3">
                <Monitor className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                    {session.device_name}
                    {isCurrent && <ColorBadge tone="emerald" variant="outline">This device</ColorBadge>}
                    {!session.is_active && <ColorBadge tone="slate" variant="outline">Ended</ColorBadge>}
                  </p>
                  <p className="truncate text-xs text-muted-foreground" title={session.user_agent}>
                    {session.user_agent}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {session.ip_address ?? "Unknown IP"} · Last active{" "}
                    {formatDateTime(session.last_seen_at)} · Expires {formatDateTime(session.expires_at)}
                  </p>
                </div>
              </div>
              {session.is_active &&
                (isCurrent ? (
                  <Button variant="outline" size="sm" onClick={logout}>
                    <LogOut aria-hidden="true" />
                    Sign out
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={revoke.isPending}
                    onClick={() => void handleRevoke(session.id)}
                  >
                    Revoke
                  </Button>
                ))}
            </li>
          );
        })}
      </ul>
      <Button
        variant="destructive"
        size="sm"
        className="self-start"
        disabled={logoutAll.isPending}
        onClick={() => void handleLogoutAll()}
      >
        Sign out of all devices
      </Button>
    </div>
  );
}

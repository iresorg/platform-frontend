"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowUpCircle, Bell, Info, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { useTenantSwitch } from "@/components/tenants/use-tenant-switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchNotifications } from "@/lib/notifications/api";
import {
  notificationKeys,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
  useUnreadCountQuery,
} from "@/lib/notifications/queries";
import type { Notification, NotificationType } from "@/lib/notifications/types";
import { useMyTenantsQuery } from "@/lib/tenants/queries";
import { cn } from "cn";

const TYPE_ICON: Record<NotificationType, React.ElementType> = {
  CASE_ASSIGNED: UserPlus,
  CASE_ESCALATED: ArrowUpCircle,
  SYSTEM: Info,
};

function timeAgo(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: "medium" });
}

// Staff header bell. Polls the unread count; when it rises, the new unread
// notifications are fetched and shown as toasts, and a sign-in with unread
// ones waiting gets one summary toast.
export function NotificationBell() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data: count } = useUnreadCountQuery();
  const { data: notifications, isLoading } = useNotificationsQuery(open);
  const { data: myTenants } = useMyTenantsQuery();
  const { switchTo } = useTenantSwitch();
  const markRead = useMarkNotificationReadMutation();
  const markAll = useMarkAllNotificationsReadMutation();
  const unread = count?.unread_count ?? 0;
  const lastCount = useRef<number | null>(null);
  const shownIds = useRef(new Set<string>());

  useEffect(() => {
    if (count === undefined || !user) return;
    const previous = lastCount.current;
    lastCount.current = count.unread_count;
    if (previous === null) {
      // Once per browser session, not on every page load.
      const key = `ires:notified:${user.id}`;
      let seen = false;
      try {
        seen = sessionStorage.getItem(key) === "1";
        sessionStorage.setItem(key, "1");
      } catch {
        // storage blocked: fall through and show it
      }
      if (!seen && count.unread_count > 0) {
        toast.info(`You have ${count.unread_count} unread notification${count.unread_count === 1 ? "" : "s"}.`);
      }
      return;
    }
    if (count.unread_count <= previous) return;
    void queryClient.invalidateQueries({ queryKey: notificationKeys.list });
    fetchNotifications({ is_read: false })
      .then((items) => {
        const fresh = items.filter((n) => !shownIds.current.has(n.id)).slice(0, count.unread_count - previous);
        for (const n of fresh) {
          shownIds.current.add(n.id);
          toast(n.title, { description: n.message });
        }
      })
      .catch(() => {
        // the badge still shows the new count
      });
  }, [count, user, queryClient]);

  async function openNotification(n: Notification) {
    if (!n.is_read) markRead.mutate(n.id);
    if (!n.case_id) return;
    // A case in another tenant 404s until that tenant is active.
    const activeSlug = myTenants?.find((t) => t.id === user?.customer_id)?.slug;
    if (n.tenant_slug && n.tenant_slug !== activeSlug) {
      const target = myTenants?.find((t) => t.slug === n.tenant_slug);
      if (!target) {
        toast.error("That case belongs to an organization you can't switch to.");
        return;
      }
      if (!(await switchTo(target.id))) return;
    }
    router.push(`/cases/${n.case_id}`);
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        className="relative cursor-pointer rounded-md p-1.5 text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Bell className="size-5" aria-hidden="true" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-none text-white tabular-nums">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <DropdownMenuLabel className="p-0 text-xs font-bold tracking-wide text-muted-foreground uppercase">
            Notifications
          </DropdownMenuLabel>
          {unread > 0 && (
            <button
              type="button"
              disabled={markAll.isPending}
              onClick={() => markAll.mutate()}
              className="cursor-pointer text-xs font-medium text-primary hover:underline disabled:opacity-60"
            >
              Mark all as read
            </button>
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <div className="max-h-96 overflow-y-auto">
          {isLoading && <p className="px-3 py-6 text-center text-sm text-muted-foreground">Loading...</p>}
          {notifications?.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">No notifications yet.</p>
          )}
          {notifications?.map((n) => {
            const Icon = TYPE_ICON[n.notification_type] ?? Info;
            return (
              <DropdownMenuItem
                key={n.id}
                onSelect={() => void openNotification(n)}
                className={cn("flex items-start gap-2.5 rounded-none px-3 py-2.5", !n.is_read && "bg-muted/50")}
              >
                <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className={cn("block text-sm", !n.is_read && "font-semibold")}>{n.title}</span>
                  <span className="block text-xs text-muted-foreground">{n.message}</span>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground">
                    {timeAgo(n.created_at)}
                    {n.tenant_slug ? ` · ${n.tenant_slug}` : ""}
                  </span>
                </span>
                {!n.is_read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

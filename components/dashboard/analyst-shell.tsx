"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  Gauge,
  Menu,
  Radio,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { Wordmark } from "@/components/brand/wordmark";
import { ThemeToggle } from "@/components/theme-toggle";
import { TenantSwitcher } from "@/components/tenants/tenant-switcher";
import { UserMenu } from "@/components/user-menu";
import { ReconnectBanner } from "@/components/shared/reconnect-banner";
import { useCan } from "@/hooks/use-can";
import { usePollingDisconnected } from "@/hooks/use-polling-disconnected";
import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "cn";

// `match` decides when a link reads as "you are here" — the queue also owns
// every case detail page (/cases/<id>), which the other sections don't.
const MONITOR_NAV_LINKS = [
  { href: "/cases/live-overview", label: "Overview", icon: Gauge, match: (p: string) => p === "/cases/live-overview" },
  {
    href: "/cases",
    label: "Triage Queue",
    icon: ClipboardList,
    match: (p: string) =>
      p === "/cases" || (/^\/cases\/[^/]+$/.test(p) && !["live-overview", "live-alerts"].includes(p.split("/")[2])),
  },
  { href: "/cases/live-alerts", label: "Alerts", icon: Radio, match: (p: string) => p.startsWith("/cases/live-alerts") },
];

const WORKSPACE_NAV_LINKS = [
  { href: "/settings/team", label: "Team", icon: Users, permission: "members.view", match: (p: string) => p === "/settings/team" },
  { href: "/settings/account", label: "Account", icon: UserCog, match: (p: string) => p === "/settings/account" },
];

function NavGroup({
  label,
  links,
  pathname,
  onNavigate,
}: {
  label: string;
  links: { href: string; label: string; icon: React.ElementType; permission?: string; match: (pathname: string) => boolean }[];
  pathname: string;
  onNavigate?: () => void;
}) {
  const can = useCan();
  const visible = links.filter((l) => !l.permission || can(l.permission));
  if (visible.length === 0) return null;
  return (
    <div className="flex flex-col gap-1">
      <p className="px-3 pt-3 pb-1 text-[0.65rem] font-bold tracking-wide text-sidebar-foreground/50 uppercase">
        {label}
      </p>
      {visible.map((link) => {
        const Icon = link.icon;
        const active = link.match(pathname);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground before:absolute before:inset-y-1.5 before:left-0 before:w-[3px] before:rounded-full before:bg-ires-red"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}

function SidebarNav({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Primary" className="flex flex-col gap-1 px-3 pb-3">
      <NavGroup
        label="Monitor"
        links={MONITOR_NAV_LINKS}
        pathname={pathname}
        onNavigate={onNavigate}
      />
      <NavGroup
        label="Workspace"
        links={WORKSPACE_NAV_LINKS}
        pathname={pathname}
        onNavigate={onNavigate}
      />
    </nav>
  );
}

export function AnalystShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isPollingDisconnected = usePollingDisconnected();

  return (
    <div className="flex flex-1">
      <a
        href="#main-content"
        className="sr-only rounded-md bg-background px-3 py-2 text-sm font-medium focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50"
      >
        Skip to content
      </a>

      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex items-center px-5 py-4">
          <Wordmark inverted className="h-7" />
        </div>
        <SidebarNav pathname={pathname} />
      </aside>

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
            <div className="flex items-center justify-between px-5 py-4">
              <Wordmark inverted className="h-7" />
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-md p-1.5 text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
                aria-label="Close navigation"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <SidebarNav
              pathname={pathname}
              onNavigate={() => setMobileNavOpen(false)}
            />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-border bg-card text-foreground">
          <div className="flex w-full items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted md:hidden"
                aria-label="Open navigation"
              >
                <Menu className="size-5" aria-hidden="true" />
              </button>
              <Wordmark className="hidden h-7 shrink-0 sm:block md:hidden" />
              <TenantSwitcher />
            </div>
            <div className="ml-auto flex shrink-0 items-center gap-3 sm:gap-4">
              <ThemeToggle className="text-muted-foreground hover:bg-muted hover:text-foreground" />
              <UserMenu subtitle={user?.role} />
            </div>
          </div>
        </header>

        <ReconnectBanner visible={isPollingDisconnected} />

        <div id="main-content" className="flex flex-1 flex-col p-4 sm:p-6">
          <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

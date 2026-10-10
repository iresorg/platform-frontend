"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertOctagon,
  Building2,
  ClipboardList,
  FileBarChart,
  Gauge,
  HardDrive,
  Menu,
  Radio,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
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

// Maps the guide's A1-A13 onto nav groups. `permission` is a guide key
// (or, for Team, a raw backend code) checked through the unified can() —
// see hooks/use-can.ts. `match` decides when a link reads as "you are
// here"; the queue also owns every case detail page.
const MONITOR_NAV_LINKS = [
  { href: "/overview", label: "Overview", icon: Gauge, permission: "metrics.read", match: (p: string) => p === "/overview" },
  { href: "/cases", label: "Triage Queue", icon: ClipboardList, permission: "case.read", match: (p: string) => p === "/cases" || /^\/cases\/[^/]+$/.test(p) },
  { href: "/alerts", label: "Alerts", icon: Radio, permission: "alert.read", match: (p: string) => p.startsWith("/alerts") },
];

const SECURITY_NAV_LINKS = [
  { href: "/fleet", label: "Agent Fleet", icon: HardDrive, permission: "agent.read", match: (p: string) => p === "/fleet" },
  { href: "/assets", label: "Assets", icon: ShieldCheck, permission: "asset.read", match: (p: string) => p === "/assets" },
  { href: "/vulnerabilities", label: "Vulnerabilities", icon: ShieldAlert, permission: "finding.read", match: (p: string) => p === "/vulnerabilities" },
  { href: "/compliance", label: "Compliance", icon: FileBarChart, permission: "compliance.read", match: (p: string) => p === "/compliance" },
  { href: "/threat-intel", label: "Threat Intel", icon: AlertOctagon, permission: "intel.read", match: (p: string) => p === "/threat-intel" },
  { href: "/ai-review", label: "AI Review", icon: Sparkles, permission: "ai.review", match: (p: string) => p === "/ai-review" },
];

const ADMIN_NAV_LINKS = [
  { href: "/tenants", label: "Tenants", icon: Building2, permission: "tenant.read", match: (p: string) => p.startsWith("/tenants") },
  { href: "/reports", label: "Reports", icon: FileBarChart, permission: "report.manage", match: (p: string) => p === "/reports" },
  { href: "/admin/users", label: "Users & Audit", icon: ScrollText, permission: "audit.read", match: (p: string) => p.startsWith("/admin") },
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
            aria-current={active ? "page" : undefined}
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
    <nav aria-label="Primary" className="flex flex-col gap-1 overflow-y-auto px-3 pb-3">
      <NavGroup label="Monitor" links={MONITOR_NAV_LINKS} pathname={pathname} onNavigate={onNavigate} />
      <NavGroup label="Security" links={SECURITY_NAV_LINKS} pathname={pathname} onNavigate={onNavigate} />
      <NavGroup label="Admin" links={ADMIN_NAV_LINKS} pathname={pathname} onNavigate={onNavigate} />
      <NavGroup label="Workspace" links={WORKSPACE_NAV_LINKS} pathname={pathname} onNavigate={onNavigate} />
    </nav>
  );
}

const TIER_LABEL: Record<string, string> = {
  tier1: "Tier 1 — Triage",
  tier2: "Tier 2 — Investigation",
  admin: "Admin",
};

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
              <UserMenu subtitle={user ? (TIER_LABEL[user.role] ?? user.role) : undefined} />
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

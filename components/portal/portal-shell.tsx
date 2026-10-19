"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  History,
  LayoutDashboard,
  Lightbulb,
  LifeBuoy,
  Menu,
  MonitorCheck,
  Radio,
  X,
} from "lucide-react";
import { Wordmark } from "@/components/brand/wordmark";
import { ThemeToggle } from "@/components/theme-toggle";
import { TenantSwitcher } from "@/components/tenants/tenant-switcher";
import { UserMenu } from "@/components/user-menu";
import { useAuth } from "@/components/auth/auth-provider";
import { cn } from "cn";

// Same shield-and-rail sidebar pattern as the analyst shell, so the two
// apps feel like one product, but the client portal still gets its own
// chrome per the guide: its own set of sections, and a red top rule on
// the content header that the analyst side doesn't have.
const NAV_LINKS = [
  { href: "/portal", label: "Overview", icon: LayoutDashboard, match: (p: string) => p === "/portal" },
  { href: "/portal/incidents", label: "Incidents", icon: History, match: (p: string) => p.startsWith("/portal/incidents") },
  { href: "/portal/devices", label: "Devices", icon: MonitorCheck, match: (p: string) => p.startsWith("/portal/devices") },
  { href: "/portal/alerts", label: "Alerts", icon: Radio, match: (p: string) => p.startsWith("/portal/alerts") },
  { href: "/portal/reports", label: "Reports", icon: BarChart3, match: (p: string) => p.startsWith("/portal/reports") },
  { href: "/portal/recommendations", label: "Recommendations", icon: Lightbulb, match: (p: string) => p.startsWith("/portal/recommendations") },
  { href: "/portal/support", label: "Support", icon: LifeBuoy, match: (p: string) => p.startsWith("/portal/support") },
];

function SidebarNav({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav aria-label="Primary" className="flex flex-col gap-1 px-3 pb-3">
      {NAV_LINKS.map((link) => {
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
    </nav>
  );
}

export function PortalShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex flex-1">
      <a
        href="#main-content"
        className="sr-only rounded-md bg-background px-3 py-2 text-sm font-medium focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50"
      >
        Skip to content
      </a>

      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex flex-col gap-1 px-5 py-4">
          <Link href="/portal" className="w-fit">
            <Wordmark inverted className="h-7" />
          </Link>
          <span className="text-xs font-medium text-sidebar-foreground/50">Client portal</span>
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
              <div className="flex flex-col gap-1">
                <Wordmark inverted className="h-7" />
                <span className="text-xs font-medium text-sidebar-foreground/50">Client portal</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="rounded-md p-1.5 text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
                aria-label="Close navigation"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <SidebarNav pathname={pathname} onNavigate={() => setMobileNavOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 border-t-[3px] border-b border-t-ires-red border-b-border bg-card text-foreground">
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
              <UserMenu subtitle={user?.customer_id} />
            </div>
          </div>
        </header>

        <div id="main-content" className="flex flex-1 flex-col bg-cool-tint/50 p-4 dark:bg-transparent sm:p-6">
          <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

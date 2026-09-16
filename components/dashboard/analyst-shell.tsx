"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WifiOff } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Wordmark } from "@/components/brand/wordmark";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { useCasesQuery } from "@/lib/cases/queries";
import { cn } from "cn";

const NAV_LINKS = [{ href: "/cases", label: "Triage Queue" }];

export function AnalystShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { data, dataUpdatedAt, errorUpdatedAt } = useCasesQuery();

  const isPollingDisconnected =
    Boolean(data) && errorUpdatedAt > 0 && errorUpdatedAt > dataUpdatedAt;

  return (
    <div className="flex flex-1 flex-col">
      <a
        href="#main-content"
        className="sr-only rounded-md bg-background px-3 py-2 text-sm font-medium focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-sidebar-border bg-sidebar px-4 py-3 text-sidebar-foreground sm:px-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-6">
          <Wordmark inverted className="h-6 shrink-0 sm:h-7" />
          <nav
            aria-label="Primary"
            className="flex items-center gap-1 text-sm font-medium"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-2 py-1.5 whitespace-nowrap transition-colors sm:px-3",
                  pathname === link.href
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden text-right text-sm md:block">
            <p className="font-medium">{user?.name}</p>
            <p className="text-xs text-sidebar-foreground/70 capitalize">
              {user?.role}
            </p>
          </div>
          <ThemeToggle className="text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground" />
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
          >
            <span className="hidden sm:inline">Sign out</span>
            <span className="sm:hidden">Out</span>
          </Button>
        </div>
      </header>

      {isPollingDisconnected && (
        <div
          role="status"
          className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-6 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
        >
          <WifiOff className="size-4" aria-hidden="true" />
          Reconnecting to Case API...
        </div>
      )}

      <div id="main-content" className="flex flex-1 flex-col gap-4 p-6">
        {children}
      </div>
    </div>
  );
}

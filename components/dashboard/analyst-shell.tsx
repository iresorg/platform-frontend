"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WifiOff } from "lucide-react";
import { Wordmark } from "@/components/brand/wordmark";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { useAuth } from "@/components/auth/auth-provider";
import { useCasesQuery } from "@/lib/cases/queries";
import { cn } from "cn";

const NAV_LINKS = [{ href: "/cases", label: "Triage Queue" }];

export function AnalystShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
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
      <header className="sticky top-0 z-40 border-b border-sidebar-border bg-sidebar text-sidebar-foreground">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
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
          <div className="flex shrink-0 items-center gap-3 sm:gap-4">
            <ThemeToggle className="text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground" />
            <UserMenu subtitle={user?.role} />
          </div>
        </div>
      </header>

      {isPollingDisconnected && (
        <div
          role="status"
          className="border-b border-amber-200 bg-amber-50 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
        >
          <div className="mx-auto flex w-full max-w-7xl items-center gap-2 px-4 py-2 sm:px-6">
            <WifiOff className="size-4" aria-hidden="true" />
            Reconnecting to Case API...
          </div>
        </div>
      )}

      <div id="main-content" className="flex flex-1 flex-col p-4 sm:p-6">
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4">
          {children}
        </div>
      </div>
    </div>
  );
}

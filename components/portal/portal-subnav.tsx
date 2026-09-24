"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  History,
  LayoutDashboard,
  Lightbulb,
  LifeBuoy,
  Radio,
} from "lucide-react";
import { cn } from "cn";

const LINKS = [
  { href: "/portal", label: "Overview", icon: LayoutDashboard },
  { href: "/portal/history", label: "History", icon: History },
  { href: "/portal/alerts", label: "Alerts", icon: Radio },
  { href: "/portal/reports", label: "Reports", icon: BarChart3 },
  { href: "/portal/recommendations", label: "Recommendations", icon: Lightbulb },
  { href: "/portal/support", label: "Support", icon: LifeBuoy },
];

// A fixed 6-up grid rather than a scrollable row: every device shows every
// section and its label, no horizontal scroll at any width. Stacked
// icon-over-label below md (tab-bar style, like a native app), inline
// icon-beside-label from md up once there's room for it.
export function PortalSubnav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Portal sections"
      className="grid grid-cols-6 gap-1 rounded-lg bg-muted/60 p-1"
    >
      {LINKS.map((link) => {
        const Icon = link.icon;
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-col items-center justify-center gap-1 rounded-md px-1 py-2 font-medium transition-colors md:flex-row md:gap-1.5 md:px-3 md:py-1.5",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0 md:size-3.5" aria-hidden="true" />
            <span className="w-full truncate text-center text-[0.65rem] leading-none md:w-auto md:text-left md:text-sm">
              {link.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

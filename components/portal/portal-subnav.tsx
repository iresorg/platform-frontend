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

export function PortalSubnav() {
  const pathname = usePathname();

  return (
    <div className="relative -mx-4 sm:-mx-6">
      <nav
        aria-label="Portal sections"
        className="flex items-center gap-1 overflow-x-auto px-4 pb-1 sm:px-6"
      >
        {LINKS.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                active
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-3.5" aria-hidden="true" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent sm:hidden"
      />
    </div>
  );
}

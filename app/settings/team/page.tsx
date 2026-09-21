"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { MembersPanel } from "@/components/team/members-panel";
import { RolesPanel } from "@/components/team/roles-panel";
import { useCan } from "@/hooks/use-can";
import { cn } from "cn";

type Tab = "members" | "roles";

export default function TeamPage() {
  const { user } = useAuth();
  const can = useCan();
  const [tab, setTab] = useState<Tab>("members");
  const tenantId = user?.customer_id;

  if (!can("members.view")) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-sm">
        You don&rsquo;t have permission to view this organization&rsquo;s team.
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "members", label: "Members" },
    ...(can("roles.view") ? [{ id: "roles" as const, label: "Roles" }] : []),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl">Team</h1>
          <p className="text-sm text-muted-foreground">
            People and roles in {user?.tenant_name ?? "your organization"}.
          </p>
        </div>
        <div role="tablist" aria-label="Team sections" className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors",
                tab === t.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tenantId && (tab === "members" ? <MembersPanel tenantId={tenantId} /> : <RolesPanel tenantId={tenantId} />)}
    </div>
  );
}

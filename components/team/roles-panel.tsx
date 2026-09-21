"use client";

import { CreateRoleDialog } from "@/components/team/create-role-dialog";
import { ColorBadge } from "@/components/ui/color-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCan } from "@/hooks/use-can";
import { useRolesQuery } from "@/lib/tenants/queries";

export function RolesPanel({ tenantId }: { tenantId: string }) {
  const can = useCan();
  const { data: roles, isLoading, isError, error } = useRolesQuery(tenantId);

  return (
    <div className="flex flex-col gap-3">
      {can("roles.create") && (
        <div className="flex justify-end">
          <CreateRoleDialog tenantId={tenantId} />
        </div>
      )}
      {isLoading && <Skeleton className="h-28 w-full rounded-xl" />}
      {isError && (
        <p className="text-sm text-destructive">
          Couldn&rsquo;t load roles{error instanceof Error ? `: ${error.message}` : "."}
        </p>
      )}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {roles?.map((role) => (
          <div key={role.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="font-heading font-bold">{role.name}</h3>
              <ColorBadge tone={role.is_system ? "slate" : "blue"} variant="outline">
                {role.is_system ? "System" : "Custom"}
              </ColorBadge>
            </div>
            <ul className="flex flex-wrap gap-1.5">
              {role.permissions.map((code) => (
                <li
                  key={code}
                  className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground"
                >
                  {code}
                </li>
              ))}
              {role.permissions.length === 0 && (
                <li className="text-sm text-muted-foreground">No permissions.</li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

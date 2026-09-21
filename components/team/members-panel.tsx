"use client";

import { useState } from "react";
import { MoreHorizontal, ShieldCheck, ShieldMinus } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { InviteMemberDialog } from "@/components/team/invite-member-dialog";
import { RoleActionDialog, type RoleAction } from "@/components/team/role-action-dialog";
import { Button } from "@/components/ui/button";
import { ColorBadge } from "@/components/ui/color-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCan } from "@/hooks/use-can";
import { useMembersQuery } from "@/lib/tenants/queries";

const HEAD = "bg-muted/50 text-xs font-bold tracking-wide text-muted-foreground uppercase";

export function MembersPanel({ tenantId }: { tenantId: string }) {
  const { user } = useAuth();
  const can = useCan();
  const { data: members, isLoading, isError, error } = useMembersQuery(tenantId);
  const [action, setAction] = useState<RoleAction | null>(null);
  const canAssign = can("roles.assign");

  return (
    <div className="flex flex-col gap-3">
      {can("members.invite") && (
        <div className="flex justify-end">
          <InviteMemberDialog tenantId={tenantId} />
        </div>
      )}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className={HEAD}>Member</TableHead>
                <TableHead className={HEAD}>Status</TableHead>
                <TableHead className={HEAD}>Joined</TableHead>
                <TableHead className={`${HEAD} w-10`} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              )}
              {isError && (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center text-sm text-destructive">
                    Couldn&rsquo;t load members{error instanceof Error ? `: ${error.message}` : "."}
                  </TableCell>
                </TableRow>
              )}
              {members?.map((member) => {
                const name = `${member.user.first_name} ${member.user.last_name}`.trim();
                const isYou = member.user.id === user?.id;
                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <p className="flex items-center gap-2 font-medium">
                        {name || member.user.email}
                        {isYou && <ColorBadge tone="blue" variant="outline">You</ColorBadge>}
                      </p>
                      <p className="text-xs text-muted-foreground">{member.user.email}</p>
                    </TableCell>
                    <TableCell>
                      <ColorBadge tone={member.status === "ACTIVE" ? "emerald" : "slate"} variant="outline">
                        {member.status.charAt(0) + member.status.slice(1).toLowerCase()}
                      </ColorBadge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(member.joined_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                    </TableCell>
                    <TableCell>
                      {canAssign && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${name || member.user.email}`}>
                              <MoreHorizontal aria-hidden="true" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => setAction({ mode: "assign", member })}>
                              <ShieldCheck aria-hidden="true" />
                              Assign role
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setAction({ mode: "remove", member })}>
                              <ShieldMinus aria-hidden="true" />
                              Remove role
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
      <RoleActionDialog tenantId={tenantId} action={action} onClose={() => setAction(null)} />
    </div>
  );
}

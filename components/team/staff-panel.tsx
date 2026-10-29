"use client";

import { useState } from "react";
import { MoreHorizontal, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { InviteStaffDialog, TIER_LABELS } from "@/components/team/invite-staff-dialog";
import { Button } from "@/components/ui/button";
import { ColorBadge } from "@/components/ui/color-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { useDisableStaffMutation, useStaffQuery, useUpdateStaffMutation } from "@/lib/staff/queries";
import type { StaffTier, StaffUser } from "@/lib/staff/types";

const HEAD = "bg-muted/50 text-xs font-bold tracking-wide text-muted-foreground uppercase";

const STATUS_TONE: Record<string, "blue" | "emerald" | "slate"> = {
  invited: "blue",
  active: "emerald",
  disabled: "slate",
};

function DisableStaffDialog({ member, onOpenChange }: { member: StaffUser | null; onOpenChange: (o: boolean) => void }) {
  const disable = useDisableStaffMutation();

  async function confirm() {
    if (!member) return;
    try {
      await disable.mutateAsync(member.id);
      toast.success(`${member.name || member.email} disabled.`);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't disable this account.");
    }
  }

  return (
    <Dialog open={Boolean(member)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Disable {member?.name || member?.email}?</DialogTitle>
          <DialogDescription>They&rsquo;ll lose access to the analyst workspace until re-enabled.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" variant="destructive" disabled={disable.isPending} onClick={() => void confirm()}>
            {disable.isPending ? "Disabling..." : "Disable"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Platform-wide staff list (tier1/tier2/admin), independent of any tenant.
export function StaffPanel() {
  const { user } = useAuth();
  const { data: staff, isLoading, isError, error } = useStaffQuery();
  const update = useUpdateStaffMutation();
  const [disableTarget, setDisableTarget] = useState<StaffUser | null>(null);

  async function changeTier(member: StaffUser, tier: StaffTier) {
    try {
      await update.mutateAsync({ userId: member.id, payload: { tier } });
      toast.success(`${member.name || member.email} is now ${TIER_LABELS[tier]}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't change the tier.");
    }
  }

  async function enable(member: StaffUser) {
    try {
      await update.mutateAsync({ userId: member.id, payload: { is_active: true } });
      toast.success(`${member.name || member.email} re-enabled.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't re-enable this account.");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <InviteStaffDialog />
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className={HEAD}>Staff member</TableHead>
                <TableHead className={HEAD}>Tier</TableHead>
                <TableHead className={HEAD}>Status</TableHead>
                <TableHead className={HEAD}>Added</TableHead>
                <TableHead className={`${HEAD} w-10`} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-10 w-full" />
                  </TableCell>
                </TableRow>
              )}
              {isError && (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-sm text-destructive">
                    Couldn&rsquo;t load staff{error instanceof Error ? `: ${error.message}` : "."}
                  </TableCell>
                </TableRow>
              )}
              {staff?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                    No staff yet.
                  </TableCell>
                </TableRow>
              )}
              {staff?.map((member) => {
                const isYou = member.id === user?.id;
                const status = member.status.toLowerCase();
                return (
                  <TableRow key={member.id}>
                    <TableCell>
                      <p className="flex items-center gap-2 font-medium">
                        {member.name || member.email}
                        {isYou && <ColorBadge tone="blue" variant="outline">You</ColorBadge>}
                      </p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </TableCell>
                    <TableCell className="text-sm">{TIER_LABELS[member.tier] ?? member.role_name}</TableCell>
                    <TableCell>
                      <ColorBadge tone={STATUS_TONE[status] ?? "slate"} variant="outline">
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </ColorBadge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(member.invited_date ?? member.created_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                    </TableCell>
                    <TableCell>
                      {!isYou && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm" aria-label={`Actions for ${member.name || member.email}`}>
                              <MoreHorizontal aria-hidden="true" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel className="text-xs text-muted-foreground">Change tier</DropdownMenuLabel>
                            {(Object.keys(TIER_LABELS) as StaffTier[]).map((tier) => (
                              <DropdownMenuItem
                                key={tier}
                                disabled={tier === member.tier || update.isPending}
                                onSelect={() => void changeTier(member, tier)}
                              >
                                {TIER_LABELS[tier]}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuSeparator />
                            {member.is_active ? (
                              <DropdownMenuItem variant="destructive" onSelect={() => setDisableTarget(member)}>
                                <UserX aria-hidden="true" />
                                Disable
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem disabled={update.isPending} onSelect={() => void enable(member)}>
                                <UserCheck aria-hidden="true" />
                                Re-enable
                              </DropdownMenuItem>
                            )}
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
      <DisableStaffDialog member={disableTarget} onOpenChange={(o) => !o && setDisableTarget(null)} />
    </div>
  );
}

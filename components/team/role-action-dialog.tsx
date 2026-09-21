"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAssignRoleMutation, useRolesQuery, useUnassignRoleMutation } from "@/lib/tenants/queries";
import type { Member } from "@/lib/tenants/types";

export type RoleAction = { mode: "assign" | "remove"; member: Member };

// The members endpoint doesn't say which roles someone already holds, so
// "remove" lists every role in the organization. Removing one the member
// never had still reports success (the backend is idempotent here), so the
// confirmation toast can't be read as proof they held it.
export function RoleActionDialog({
  tenantId,
  action,
  onClose,
}: {
  tenantId: string;
  action: RoleAction | null;
  onClose: () => void;
}) {
  const [roleId, setRoleId] = useState("");
  const { data: roles } = useRolesQuery(tenantId, Boolean(action));
  const assign = useAssignRoleMutation(tenantId);
  const unassign = useUnassignRoleMutation(tenantId);
  const pending = assign.isPending || unassign.isPending;

  function close() {
    setRoleId("");
    onClose();
  }

  async function submit() {
    if (!action || !roleId) return;
    const mutation = action.mode === "assign" ? assign : unassign;
    try {
      const res = await mutation.mutateAsync({ membershipId: action.member.id, roleId });
      toast.success(res.message);
      close();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "That didn't work.");
    }
  }

  const verb = action?.mode === "remove" ? "Remove role from" : "Assign role to";
  const who = action ? `${action.member.user.first_name} ${action.member.user.last_name}`.trim() || action.member.user.email : "";

  return (
    <Dialog open={Boolean(action)} onOpenChange={(o) => !o && close()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {verb} {who}
          </DialogTitle>
          <DialogDescription>
            {action?.mode === "remove"
              ? "Pick the role to take away."
              : "Roles decide which permissions this member has in the organization."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1.5">
          <Label id="role-action-label">Role</Label>
          <Select value={roleId} onValueChange={setRoleId}>
            <SelectTrigger aria-labelledby="role-action-label">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {roles?.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={action?.mode === "remove" ? "destructive" : "default"}
            disabled={!roleId || pending}
            onClick={() => void submit()}
          >
            {action?.mode === "remove" ? "Remove role" : "Assign role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

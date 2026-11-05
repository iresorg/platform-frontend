"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ClientChecklist } from "@/components/team/client-checklist";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCustomersQuery } from "@/lib/customers/queries";
import { useSetStaffTenantsMutation, useStaffTenantsQuery } from "@/lib/staff/queries";
import type { AssignedTenant, StaffUser } from "@/lib/staff/types";

function ManageClientsForm({ member, assigned, onDone }: { member: StaffUser; assigned: AssignedTenant[]; onDone: () => void }) {
  const { data: customers } = useCustomersQuery();
  const save = useSetStaffTenantsMutation();
  const clientIds = new Set(customers?.map((c) => c.id));
  const [selected, setSelected] = useState(() => assigned.filter((t) => clientIds.has(t.id)).map((t) => t.id));
  // The set is replaced on save, so tenants that aren't clients (such as the
  // holding tenant) are sent back unchanged rather than dropped.
  const kept = assigned.filter((t) => !clientIds.has(t.id));

  async function submit() {
    try {
      await save.mutateAsync({ userId: member.id, tenantIds: [...selected, ...kept.map((t) => t.id)] });
      toast.success(`Updated clients for ${member.name || member.email}.`);
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't update their clients.");
    }
  }

  return (
    <>
      <ClientChecklist idPrefix="manage-client" value={selected} onChange={setSelected} />
      {kept.length > 0 && (
        <p className="text-xs text-muted-foreground">Also assigned, unchanged: {kept.map((t) => t.name).join(", ")}</p>
      )}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>Cancel</Button>
        <Button type="button" disabled={save.isPending} onClick={() => void submit()}>
          {save.isPending ? "Saving..." : "Save"}
        </Button>
      </DialogFooter>
    </>
  );
}

export function ManageClientsDialog({ member, onOpenChange }: { member: StaffUser | null; onOpenChange: (o: boolean) => void }) {
  const { data: assigned, isLoading, isError } = useStaffTenantsQuery(member?.id);
  const { isLoading: customersLoading } = useCustomersQuery();

  return (
    <Dialog open={Boolean(member)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Clients for {member?.name || member?.email}</DialogTitle>
          <DialogDescription>They can switch into these clients and work on their cases and alerts.</DialogDescription>
        </DialogHeader>
        {isError ? (
          <p className="text-sm text-destructive">Couldn&rsquo;t load their current clients.</p>
        ) : isLoading || customersLoading || !assigned || !member ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <ManageClientsForm key={member.id} member={member} assigned={assigned} onDone={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

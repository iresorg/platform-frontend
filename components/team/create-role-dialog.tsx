"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateRoleMutation, usePermissionsQuery } from "@/lib/tenants/queries";
import type { Permission } from "@/lib/tenants/types";

function groupByArea(permissions: Permission[]): [string, Permission[]][] {
  const groups = new Map<string, Permission[]>();
  for (const p of permissions) {
    const area = p.code.split(".")[0];
    groups.set(area, [...(groups.get(area) ?? []), p]);
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export function CreateRoleDialog({ tenantId }: { tenantId: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { data: permissions, isLoading } = usePermissionsQuery(open);
  const create = useCreateRoleMutation(tenantId);
  const groups = useMemo(() => groupByArea(permissions ?? []), [permissions]);

  function close(next: boolean) {
    setOpen(next);
    if (!next) {
      setName("");
      setSelected(new Set());
    }
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const role = await create.mutateAsync({ name: name.trim(), permission_ids: [...selected] });
      toast.success(`Created role ${role.name}.`);
      close(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't create the role.");
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus aria-hidden="true" />
        Create role
      </Button>
      <Dialog open={open} onOpenChange={close}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Create role</DialogTitle>
            <DialogDescription>Choose exactly what members with this role can do.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="role-name">Name</Label>
              <Input id="role-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-1 text-sm font-medium">
                Permissions <span className="font-normal text-muted-foreground">({selected.size} selected)</span>
              </legend>
              {isLoading && <Skeleton className="h-32 w-full" />}
              <div className="grid max-h-72 grid-cols-1 gap-x-6 gap-y-4 overflow-y-auto pr-1 sm:grid-cols-2">
                {groups.map(([area, items]) => (
                  <div key={area} className="flex flex-col gap-1.5">
                    <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
                      {area.replace("_", " ")}
                    </p>
                    {items.map((p) => (
                      <label key={p.id} className="flex cursor-pointer items-start gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="mt-1 size-4 accent-[var(--brand-navy)]"
                          checked={selected.has(p.id)}
                          onChange={() => toggle(p.id)}
                        />
                        <span>
                          {p.name}
                          <span className="block text-xs text-muted-foreground">{p.description}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                ))}
              </div>
            </fieldset>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => close(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!name.trim() || selected.size === 0 || create.isPending}>
                {create.isPending ? "Creating..." : "Create role"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

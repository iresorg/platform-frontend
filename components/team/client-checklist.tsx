"use client";

import { useCustomersQuery } from "@/lib/customers/queries";
import { SYSTEM_TENANT_NAME } from "@/lib/tenants/queries";

// Onboarded clients as checkboxes. A customer's id is its tenant's id, which
// is what the staff tenant routes take.
export function ClientChecklist({
  value,
  onChange,
  idPrefix,
}: {
  value: string[];
  onChange: (ids: string[]) => void;
  idPrefix: string;
}) {
  const { data: customers, isLoading, isError } = useCustomersQuery();
  const clients = customers?.filter((c) => c.name !== SYSTEM_TENANT_NAME);

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading clients...</p>;
  if (isError) return <p className="text-sm text-destructive">Couldn&rsquo;t load clients.</p>;
  if (!clients?.length) return <p className="text-sm text-muted-foreground">No clients have been onboarded yet.</p>;

  function toggle(id: string, on: boolean) {
    onChange(on ? [...value, id] : value.filter((v) => v !== id));
  }

  return (
    <div className="flex max-h-52 flex-col gap-1 overflow-y-auto rounded-md border border-border p-2">
      {clients.map((c) => (
        <label key={c.id} htmlFor={`${idPrefix}-${c.id}`} className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-sm hover:bg-muted">
          <input
            id={`${idPrefix}-${c.id}`}
            type="checkbox"
            className="size-4 accent-primary"
            checked={value.includes(c.id)}
            onChange={(e) => toggle(c.id, e.target.checked)}
          />
          {c.name}
        </label>
      ))}
    </div>
  );
}

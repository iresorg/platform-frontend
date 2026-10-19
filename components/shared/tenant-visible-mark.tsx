import { Eye } from "lucide-react";

// Wherever staff write or approve text a tenant will see (guide 1 golden
// rule 3, used by the verdict modal, AI review and reports). Wraps a
// field or preview in an unmistakable "this reaches the tenant" frame —
// never subtle, because the cost of missing it is internal shorthand
// landing in front of a customer.
export function TenantVisibleMark({
  label = "Shown to the tenant",
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border-2 border-ocean/50 bg-tone-blue-bg/30 p-3">
      <p className="flex items-center gap-1.5 text-xs font-bold text-tone-blue-fg uppercase">
        <Eye className="size-3.5" aria-hidden="true" />
        {label}
      </p>
      {children}
    </div>
  );
}

// A compact preview pane for "how the tenant will actually see this" —
// pairs with TenantVisibleMark on the editor side.
export function TenantPreview({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border p-3">
      <p className="mb-2 text-xs font-bold tracking-wide text-muted-foreground uppercase">How it will look in the portal</p>
      <div className="rounded-lg border border-border bg-card p-3">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1.5 text-sm whitespace-pre-wrap text-muted-foreground">
          {body || "Their text will appear here as you type."}
        </p>
      </div>
    </div>
  );
}

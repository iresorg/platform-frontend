import { CopyButton } from "@/components/shared/copy-button";

function Row({ label, value, copy }: { label: string; value: string; copy?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <dt className="text-xs font-bold tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className="flex min-w-0 items-center gap-1 font-mono text-xs">
        <span className="truncate">{value}</span>
        {copy && <CopyButton text={value} label={label.toLowerCase()} />}
      </dd>
    </div>
  );
}

export function EndpointCard({
  name,
  id,
  ip,
  os,
}: {
  name?: string;
  id?: string;
  ip?: string;
  os?: string;
}) {
  if (!name && !id && !ip && !os) return null;
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="font-heading font-bold">Endpoint</h2>
      <dl className="mt-2 divide-y divide-border">
        {name && <Row label="Hostname" value={name} copy />}
        {id && <Row label="Agent ID" value={id} />}
        {ip && <Row label="IP address" value={ip} copy />}
        {os && <Row label="OS" value={os} />}
      </dl>
    </section>
  );
}

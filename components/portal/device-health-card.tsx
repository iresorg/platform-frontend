import { Donut } from "@/components/shared/donut";
import { isDeviceOffline } from "@/lib/portal/format";
import type { PortalEndpoint } from "@/lib/portal/types";

// A real per-device summary now (GET /portal/endpoints), not an aggregate
// count — still nothing technical, no agent IDs.
export function DeviceHealthCard({ devices }: { devices: PortalEndpoint[] | undefined }) {
  const total = devices?.length ?? 0;
  const offline = (devices ?? []).filter((d) => isDeviceOffline(d.status)).length;
  const active = total - offline;

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h2 className="mb-4 text-xs font-bold tracking-wide text-muted-foreground uppercase">Devices</h2>
      {total === 0 ? (
        <p className="text-sm text-muted-foreground">We&rsquo;re connecting your devices. They&rsquo;ll appear here once they start reporting.</p>
      ) : (
        <div className="flex flex-col gap-3">
          <Donut
            size={112}
            centerLabel="devices"
            ariaLabel={`${active} of ${total} devices reporting normally`}
            segments={[
              { label: "Reporting normally", value: active, color: "var(--emerald)" },
              { label: "Not reporting", value: offline, color: "var(--sunset)" },
            ]}
          />
          <p className="text-sm">
            <span className="font-medium">{active} of {total}</span> devices reporting normally
            {offline > 0 && <span className="text-muted-foreground"> · {offline} device{offline === 1 ? " is" : "s are"} not reporting — worth checking they&rsquo;re powered on and connected.</span>}
          </p>
        </div>
      )}
    </section>
  );
}

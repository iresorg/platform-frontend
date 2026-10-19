import { StatusPill } from "@/components/shared/status-pill";

export function AlertStatusBadge({ status }: { status: string }) {
  return <StatusPill status={status} />;
}

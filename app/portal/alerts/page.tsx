"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { CustomerStatusBadge } from "@/components/portal/customer-status-badge";
import { PortalSubnav } from "@/components/portal/portal-subnav";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCustomerCasesQuery } from "@/lib/cases/queries";
import { describeEvidence } from "@/lib/portal/customer-view";

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PortalAlertsPage() {
  const { user } = useAuth();
  const customerId = user?.customer_id ?? "";
  const { data: cases, isLoading } = useCustomerCasesQuery(customerId);

  const sorted = [...(cases ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="flex flex-col gap-4">
      <PortalSubnav />

      <div>
        <h1 className="text-xl">Alerts</h1>
        <p className="text-sm text-muted-foreground">
          A chronological feed of everything detected on your account.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="bg-muted/50 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  Time
                </TableHead>
                <TableHead className="bg-muted/50 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  What was detected
                </TableHead>
                <TableHead className="bg-muted/50 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={3}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))}

              {!isLoading && sorted.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="py-16 text-center text-muted-foreground"
                    role="status"
                  >
                    Nothing detected on your account yet.
                  </TableCell>
                </TableRow>
              )}

              {sorted.map((c) => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer transition-colors hover:bg-muted/40"
                >
                  <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                    {formatTimestamp(c.created_at)}
                  </TableCell>
                  <TableCell className="max-w-lg">
                    <Link
                      href={`/portal/cases/${c.id}`}
                      className="text-sm hover:underline"
                    >
                      {describeEvidence(c)}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <CustomerStatusBadge status={c.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

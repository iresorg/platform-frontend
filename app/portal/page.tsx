"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { CustomerStatusBadge } from "@/components/portal/customer-status-badge";
import { PortalStats } from "@/components/portal/portal-stats";
import { SecurityBanner } from "@/components/portal/security-banner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNow } from "@/hooks/use-now";
import { useCustomerCasesQuery } from "@/lib/cases/queries";

function formatTime(iso: string): string {
  return `${new Date(iso).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export default function PortalPage() {
  const router = useRouter();
  const { user } = useAuth();
  const now = useNow();
  const customerId = user?.customer_id ?? "";
  const { data: cases, isLoading } = useCustomerCasesQuery(customerId);

  const sorted = [...(cases ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="flex flex-col gap-5">
      {isLoading ? (
        <Skeleton className="h-24 w-full rounded-xl" />
      ) : (
        <SecurityBanner cases={cases ?? []} now={now} />
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <PortalStats cases={cases ?? []} />
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-heading font-bold">Recent incidents</h2>
          <p className="text-sm text-muted-foreground">
            Plain-language summaries from your security team
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10 bg-muted/50 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  #
                </TableHead>
                <TableHead className="bg-muted/50 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  Incident
                </TableHead>
                <TableHead className="bg-muted/50 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  Status
                </TableHead>
                <TableHead className="bg-muted/50 text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  Time
                </TableHead>
                <TableHead className="w-8 bg-muted/50" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  </TableRow>
                ))}

              {!isLoading && sorted.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-16 text-center text-muted-foreground"
                    role="status"
                  >
                    No security incidents recorded for your account.
                  </TableCell>
                </TableRow>
              )}

              {sorted.map((c, index) => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer transition-colors hover:bg-muted/40"
                  onClick={() => router.push(`/portal/cases/${c.id}`)}
                >
                  <TableCell className="text-sm text-muted-foreground tabular-nums">
                    {index + 1}
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="font-medium">{c.title}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {c.summary}
                    </p>
                  </TableCell>
                  <TableCell>
                    <CustomerStatusBadge status={c.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatTime(c.created_at)}
                  </TableCell>
                  <TableCell>
                    <ChevronRight
                      className="size-4 text-muted-foreground/50"
                      aria-hidden="true"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="border-t border-border px-5 py-4 text-xs text-muted-foreground">
          <p>
            Detection rule identifiers, agent logs and internal analyst notes
            are not shown in this portal.
          </p>
          <p>Contact your service manager if you need the full forensic record.</p>
        </div>
      </div>
    </div>
  );
}

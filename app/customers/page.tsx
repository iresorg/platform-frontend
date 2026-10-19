"use client";

import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { SkeletonTable } from "@/components/shared/skeletons";
import { TestBadge } from "@/components/shared/test-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCustomersQuery } from "@/lib/customers/queries";

const HEAD = "bg-muted/60 text-xs font-bold tracking-wide text-muted-foreground uppercase";
const COLS = 5;

export default function CustomersPage() {
  const router = useRouter();
  const { data: customers, isLoading, isError, error } = useCustomersQuery();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl">Customers</h1>
        <p className="text-sm text-muted-foreground">Client setup, onboarding progress and portal access.</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className={HEAD}>Name</TableHead>
                <TableHead className={HEAD}>Branches</TableHead>
                <TableHead className={HEAD}>Endpoints</TableHead>
                <TableHead className={`${HEAD} text-right`}>Open cases</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && <SkeletonTable rows={6} cols={COLS} />}

              {isError && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={COLS} className="py-14 text-center text-sm text-destructive">
                    Couldn&rsquo;t load customers{error instanceof Error ? `: ${error.message}` : "."}
                  </TableCell>
                </TableRow>
              )}

              {!isLoading && !isError && customers?.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={COLS} className="p-0">
                    <EmptyState icon={Building2} title="No customers yet" description="Clients appear here once they've been set up." />
                  </TableCell>
                </TableRow>
              )}

              {customers?.map((c) => (
                <TableRow key={c.id} className="cursor-pointer" onClick={() => router.push(`/customers/${c.id}`)}>
                  <TableCell className="font-medium">
                    <span className="inline-flex items-center gap-2">
                      {c.name}
                      {c.is_test && <TestBadge />}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{c.branch_count}</TableCell>
                  <TableCell className="text-sm tabular-nums">{c.endpoints_active} / {c.endpoints_total}</TableCell>
                  <TableCell className="text-right text-sm font-medium tabular-nums">{c.open_cases}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

"use client";

import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { SkeletonTable } from "@/components/shared/skeletons";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "cn";

const HEAD = "bg-muted/60 text-xs font-bold tracking-wide text-muted-foreground uppercase";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  headClassName?: string;
  cellClassName?: string;
}

// Generic server-sorted/filtered table (guide 2.3) for every new list
// screen: loading skeleton, "empty" vs "filtered to nothing" (different
// messages, per the guide), and an optional row click. Sort/filter state
// itself stays with the caller (usually the URL) — this only renders.
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading,
  error,
  onRowClick,
  hasFilters = false,
  onClearFilters,
  emptyIcon,
  emptyTitle,
  emptyDescription,
}: {
  columns: DataTableColumn<T>[];
  rows: T[] | undefined;
  rowKey: (row: T) => string;
  loading: boolean;
  error?: string | null;
  onRowClick?: (row: T) => void;
  hasFilters?: boolean;
  onClearFilters?: () => void;
  emptyIcon: React.ElementType;
  emptyTitle: string;
  emptyDescription?: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((c) => (
                <TableHead key={c.key} className={cn(HEAD, c.headClassName)}>
                  {c.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && !rows && <SkeletonTable rows={8} cols={columns.length} />}

            {error && !rows && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="py-14 text-center text-sm text-destructive">
                  Couldn&rsquo;t load: {error}
                </TableCell>
              </TableRow>
            )}

            {rows?.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="p-0">
                  {hasFilters ? (
                    <EmptyState
                      icon={SearchX}
                      title="No results match these filters"
                      description="Try widening the search, or clear the filters to see everything."
                      action={onClearFilters && <Button variant="outline" onClick={onClearFilters}>Clear filters</Button>}
                    />
                  ) : (
                    <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
                  )}
                </TableCell>
              </TableRow>
            )}

            {rows?.map((row) => (
              <TableRow
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={onRowClick ? "cursor-pointer" : undefined}
              >
                {columns.map((c) => (
                  <TableCell key={c.key} className={c.cellClassName}>
                    {c.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

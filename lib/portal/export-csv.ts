import { CUSTOMER_STATUS_LABEL } from "@/lib/portal/format";
import type { PortalCaseListItem } from "@/lib/portal/types";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function portalCasesToCsv(cases: PortalCaseListItem[]): string {
  const header = ["Incident", "Status", "Summary", "Reported"];
  const rows = cases.map((c) => [
    c.title,
    CUSTOMER_STATUS_LABEL[c.status],
    c.summary,
    new Date(c.created_at).toLocaleString(),
  ]);
  return [header, ...rows]
    .map((row) => row.map(csvEscape).join(","))
    .join("\n");
}

export function downloadPortalCasesCsv(cases: PortalCaseListItem[], filename = "incident-history.csv") {
  const csv = portalCasesToCsv(cases);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

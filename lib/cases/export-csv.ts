import type { Case } from "@/lib/cases/types";

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function casesToCsv(cases: Case[]): string {
  const header = ["Incident", "Status", "Summary", "Reported"];
  const rows = cases.map((c) => [
    c.title,
    c.status,
    c.summary,
    new Date(c.created_at).toLocaleString(),
  ]);
  return [header, ...rows]
    .map((row) => row.map(csvEscape).join(","))
    .join("\n");
}

export function downloadCasesCsv(cases: Case[], filename = "incident-history.csv") {
  const csv = casesToCsv(cases);
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

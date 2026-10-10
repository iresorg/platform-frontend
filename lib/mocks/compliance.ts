"use client";

// Stands in for GET /compliance, GET /portal/compliance — see the backend
// asks list. No endpoint exists; Security owns the mapping version and
// control set per C-09, so these numbers are illustrative only.

import { useQuery } from "@tanstack/react-query";
import { mockDelay, mockInt } from "@/lib/mocks/helpers";

export interface MockControl {
  id: string;
  title: string;
  status: "passed" | "failed" | "not_applicable";
  mapped_checks: string[];
}

export interface MockFramework {
  name: string;
  version: string;
  effective_date: string;
  score: number;
  passed: number;
  failed: number;
  not_applicable: number;
  controls: MockControl[];
}

const FRAMEWORKS = ["ISO 27001", "PCI DSS", "NDPA", "CBN Risk-Based Framework"];
const CONTROL_TITLES = [
  "Access control policy is documented and reviewed",
  "Multi-factor authentication required for privileged accounts",
  "Endpoint detection deployed on all critical assets",
  "Vulnerability scans run on a defined schedule",
  "Incident response plan tested in the last 12 months",
  "Data encrypted at rest and in transit",
  "Third-party vendor risk assessments on file",
];

function buildFramework(name: string): MockFramework {
  const controls: MockControl[] = CONTROL_TITLES.map((title, i) => ({
    id: `${name}-ctrl-${i}`,
    title,
    status: i % 5 === 4 ? "failed" : i % 7 === 6 ? "not_applicable" : "passed",
    mapped_checks: [`check-${i}-a`, `check-${i}-b`],
  }));
  const passed = controls.filter((c) => c.status === "passed").length;
  const failed = controls.filter((c) => c.status === "failed").length;
  const notApplicable = controls.filter((c) => c.status === "not_applicable").length;
  return {
    name,
    version: "2.1",
    effective_date: "2026-06-01",
    score: Math.round((passed / (passed + failed)) * 100),
    passed,
    failed,
    not_applicable: notApplicable,
    controls,
  };
}

const frameworks = FRAMEWORKS.map(buildFramework);

export function useMockComplianceQuery() {
  return useQuery({ queryKey: ["mock", "compliance"], queryFn: () => mockDelay(frameworks) });
}

// Portal-safe: plain area titles and a status label, no control IDs or
// "mapped_checks" internals (guide P7).
export function toPortalCompliance() {
  return frameworks.map((f) => ({
    name: f.name,
    version: f.version,
    score: f.score,
    as_of: f.effective_date,
    areas: f.controls
      .filter((c) => c.status !== "not_applicable")
      .map((c) => ({ plain_title: c.title, status_label: c.status === "passed" ? "In place" : "Needs attention" })),
  }));
}

export function useMockPortalComplianceQuery() {
  return useQuery({ queryKey: ["mock", "portal-compliance"], queryFn: () => mockDelay(toPortalCompliance(), mockInt(300, 500)) });
}

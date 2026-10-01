// Small formatting helpers for the portal's real data. There's no
// client-side sanitization step any more — /portal/* already strips
// technical fields server-side — so this file is just presentation:
// status wording and the posture banner's tone.

import type { BadgeTone } from "@/components/ui/color-badge";
import type { PortalCaseStatus } from "@/lib/portal/types";

// NEW and OPEN both read as "hasn't been looked at differently from
// investigating" to a customer, so they share a label with INVESTIGATING
// per the guide ("new and investigating both become Under review").
export const CUSTOMER_STATUS_LABEL: Record<PortalCaseStatus, string> = {
  NEW: "Under review",
  OPEN: "Under review",
  INVESTIGATING: "Under review",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export const CUSTOMER_STATUS_TONE: Record<PortalCaseStatus, BadgeTone> = {
  NEW: "blue",
  OPEN: "blue",
  INVESTIGATING: "blue",
  RESOLVED: "emerald",
  CLOSED: "slate",
};

export function isPortalCaseDone(status: PortalCaseStatus): boolean {
  return status === "RESOLVED" || status === "CLOSED";
}

// The backend now sends the posture string directly (e.g. "Protected")
// rather than a code to map — "Protected" is the calm green state,
// anything else means something's open and gets the amber "under review"
// treatment. Keeps this working regardless of the exact wording the
// backend settles on for the non-protected case.
export function isProtected(protectionStatus: string): boolean {
  return protectionStatus.trim().toLowerCase() === "protected";
}

export function formatDeviceStatus(status: string): string {
  const s = status.trim().toLowerCase();
  if (s === "active") return "Protected";
  if (s === "disconnected") return "Not reporting";
  if (s === "pending" || s === "never_connected") return "Setting up";
  return status;
}

export function isDeviceOffline(status: string): boolean {
  const s = status.trim().toLowerCase();
  return s !== "active";
}

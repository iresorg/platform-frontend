import type { JsonObject } from "@/lib/alerts/types";

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nonEmptyString(value: unknown): string | undefined {
  return typeof value === "string" && value !== "" ? value : undefined;
}

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((v) => typeof v === "string" || typeof v === "number").map(String)
    : [];
}

// "pci_dss" -> "Pci Dss", "accountId" -> "Account Id"
export function humanizeKey(key: string): string {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const FRAMEWORK_LABELS: Record<string, string> = {
  gdpr: "GDPR",
  pci_dss: "PCI DSS",
  hipaa: "HIPAA",
  nist_800_53: "NIST 800-53",
  tsc: "TSC",
  gpg13: "GPG 13",
};

export interface ParsedRawPayload {
  fullLog?: string;
  location?: string;
  decoder?: string;
  manager?: string;
  inputType?: string;
  agentGroup?: string;
  timestamp?: string;
  firedTimes?: number;
  mailAlert?: boolean;
  // Compliance / ATT&CK mappings found on the rule, e.g. GDPR, PCI DSS.
  frameworks: { label: string; values: string[] }[];
}

// Pulls the useful bits out of a Wazuh raw_payload. Every lookup is
// guarded, so a payload missing any of these (or shaped differently)
// yields fewer fields, never an error.
export function parseRawPayload(raw: JsonObject | null): ParsedRawPayload {
  const parsed: ParsedRawPayload = { frameworks: [] };
  if (!raw) return parsed;

  parsed.fullLog = nonEmptyString(raw.full_log);
  parsed.location = nonEmptyString(raw.location);
  parsed.timestamp = nonEmptyString(raw.timestamp) ?? nonEmptyString(raw["@timestamp"]);
  if (isObject(raw.decoder)) parsed.decoder = nonEmptyString(raw.decoder.name);
  if (isObject(raw.manager)) parsed.manager = nonEmptyString(raw.manager.name);
  if (isObject(raw.input)) parsed.inputType = nonEmptyString(raw.input.type);

  if (isObject(raw.agent) && isObject(raw.agent.labels) && isObject(raw.agent.labels.agent)) {
    parsed.agentGroup = nonEmptyString(raw.agent.labels.agent.group);
  }

  if (isObject(raw.rule)) {
    if (typeof raw.rule.firedtimes === "number") parsed.firedTimes = raw.rule.firedtimes;
    if (typeof raw.rule.mail === "boolean") parsed.mailAlert = raw.rule.mail;

    for (const [key, value] of Object.entries(raw.rule)) {
      if (key === "groups") continue; // shown separately as rule groups
      if (key === "mitre" && isObject(value)) {
        for (const [mitreKey, mitreValue] of Object.entries(value)) {
          const values = stringList(mitreValue);
          if (values.length) parsed.frameworks.push({ label: `MITRE ${humanizeKey(mitreKey)}`, values });
        }
        continue;
      }
      const values = stringList(value);
      if (values.length) {
        parsed.frameworks.push({ label: FRAMEWORK_LABELS[key] ?? humanizeKey(key), values });
      }
    }
  }
  return parsed;
}

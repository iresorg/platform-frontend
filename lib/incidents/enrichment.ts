// The backend types opencti_enrichment and raw_alert_ref as "any", and
// both are null on most cases. These parsers accept whatever shape shows up
// and return only what they can stand behind — never a "null" string, never
// an empty card. The expected shapes come from the iRES frontend guide.

type Json = { [key: string]: unknown };

function isObject(v: unknown): v is Json {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
function str(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() !== "" ? v : undefined;
}
function strList(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x) => typeof x === "string" || typeof x === "number").map(String) : [];
}
function maybeJson(v: unknown): unknown {
  if (typeof v !== "string") return v;
  try {
    return JSON.parse(v);
  } catch {
    return v;
  }
}

export interface ParsedEnrichment {
  confidence?: number;
  indicators: string[];
  iocType?: string;
  matchType?: string;
  source?: string;
  description?: string;
  malwareFamily?: string;
  threatActor?: string;
}

// Returns null unless the case is genuinely enriched — the UI then leaves
// the intel card out entirely rather than showing an empty one.
export function parseEnrichment(raw: unknown): ParsedEnrichment | null {
  const value = maybeJson(raw);
  if (typeof value === "string") {
    const text = str(value);
    return text ? { indicators: [], description: text } : null;
  }
  if (!isObject(value)) return null;
  if (value.is_enriched === false) return null;

  const parsed: ParsedEnrichment = {
    confidence: typeof value.confidence === "number" ? value.confidence : undefined,
    indicators: strList(value.indicators),
    iocType: str(value.ioc_type),
    matchType: str(value.match_type),
    source: str(value.source),
    description: str(value.description),
    malwareFamily: str(value.malware_family),
    threatActor: str(value.threat_actor),
  };
  const hasContent =
    parsed.confidence !== undefined || parsed.indicators.length > 0 || parsed.description || parsed.source;
  return value.is_enriched === true || hasContent ? parsed : null;
}

const IOC_TYPE_LABEL: Record<string, string> = {
  ipv4: "IPv4",
  ipv6: "IPv6",
  domain: "Domain",
  url: "URL",
  file_hash: "File hash",
  hash: "File hash",
  md5: "MD5",
  sha1: "SHA-1",
  sha256: "SHA-256",
};

export function iocTypeLabel(type: string | undefined): string | undefined {
  if (!type) return undefined;
  return IOC_TYPE_LABEL[type.toLowerCase()] ?? type.toUpperCase();
}

// match_type is an internal code; analysts read a plain sentence.
export function matchVerdict(matchType: string | undefined): string {
  if (matchType === "indicator_only" || matchType === "indicator_and_observable") {
    return "Confirmed malicious indicator";
  }
  return "Seen in threat intelligence";
}

export interface ParsedAlertRef {
  agentId?: string;
  agentName?: string;
  agentIp?: string;
  os?: string;
  ruleId?: string;
  ruleDescription?: string;
  fullLog?: string;
  mitre: { label: string; values: string[] }[];
}

export function parseAlertRef(raw: unknown): ParsedAlertRef {
  const ref = maybeJson(raw);
  const out: ParsedAlertRef = { mitre: [] };
  if (!isObject(ref)) return out;

  const agent = isObject(ref.agent) ? ref.agent : {};
  const rule = isObject(ref.rule) ? ref.rule : {};
  out.agentId = str(ref.agent_id) ?? str(agent.id);
  out.agentName = str(ref.agent_name) ?? str(agent.name);
  out.agentIp = str(ref.agent_ip) ?? str(agent.ip);
  const os = ref.os ?? agent.os;
  out.os = isObject(os) ? str(os.name) ?? str(os.platform) : str(os);
  out.ruleId = str(ref.rule_id) ?? str(rule.id);
  out.ruleDescription = str(ref.rule_description) ?? str(rule.description);
  out.fullLog = str(ref.full_log);

  const mitre = isObject(ref.mitre) ? ref.mitre : isObject(rule.mitre) ? rule.mitre : null;
  if (mitre) {
    const groups: [string, string][] = [
      ["id", "Technique ID"],
      ["technique", "Technique"],
      ["tactic", "Tactic"],
    ];
    for (const [key, label] of groups) {
      const values = strList(mitre[key]);
      if (values.length) out.mitre.push({ label, values });
    }
  }
  return out;
}

export type TimelineKind =
  | "created" | "occurrence" | "enriched" | "assigned" | "note" | "status" | "escalated" | "resolved" | "verdict";

// event_type is empty on older records, so fall back to reading the text
// the backend writes ("Status changed to...", "Incident opened by...").
export function classifyNote(note: { event_type?: string; content: string }): TimelineKind {
  const t = `${note.event_type ?? ""} ${note.content}`.toLowerCase();
  // verdict_set / guidance_updated — checked first: "Verdict set to
  // RESOLVED" style text never happens, but "resolved" as a classification
  // word could still collide with the resolved-status check below.
  if (/verdict_set|verdict set|guidance_updated|guidance updated/.test(t)) return "verdict";
  if (/resolved|resolution/.test(t) && /status|verdict|resolv/.test(t)) return "resolved";
  if (/escalat/.test(t)) return "escalated";
  if (/enrich/.test(t)) return "enriched";
  if (/assign/.test(t)) return "assigned";
  if (/status/.test(t)) return "status";
  if (/occurrence|seen again|duplicate|dedupe/.test(t)) return "occurrence";
  if (/opened|created/.test(t)) return "created";
  return "note";
}

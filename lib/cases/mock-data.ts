import { computeRiskScore } from "@/lib/cases/risk";
import type { Case, CaseEvent } from "@/lib/cases/types";

const now = Date.now();
const minutes = (n: number) => new Date(now + n * 60_000).toISOString();
const hoursAgo = (n: number) => new Date(now - n * 60 * 60_000).toISOString();

// risk_score is derived, not authored by hand, so it can never drift from
// the severity/confidence it's supposed to summarize.
const rawMockCases: Omit<Case, "risk_score">[] = [
  {
    id: "cs_8f91a2b",
    customer_id: "cust_acme_01",
    customer_name: "Acme Bank - Victoria Island",
    source: "wazuh",
    severity: 12,
    status: "investigating",
    assigned_analyst: { id: "an_01", name: "Adesina Islam" },
    title: "Suspicious Encoded PowerShell Execution",
    summary:
      "powershell.exe executed an encoded command attempting outbound connection.",
    sla_due_at: minutes(8),
    created_at: hoursAgo(1),
    verdict: null,
    opencti_enrichment: {
      is_enriched: true,
      malware_family: "Cobalt Strike",
      confidence: 90,
      threat_actor: "APT29",
      indicators: [
        "192.0.2.45",
        "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b85",
      ],
    },
    raw_alert_ref: {
      agent_id: "004",
      agent_name: "WORKSTATION-FINANCE-02",
      rule_id: "100201",
      full_log: "powershell.exe -e a3lsbCAtOSB3aW5sb2dvbg==",
    },
  },
  {
    id: "cs_2c74e91",
    customer_id: "cust_acme_01",
    customer_name: "Acme Bank - Victoria Island",
    source: "wazuh",
    severity: 6,
    status: "new",
    assigned_analyst: null,
    title: "Multiple Failed SSH Login Attempts",
    summary:
      "12 failed SSH authentication attempts from a single external IP within 3 minutes.",
    sla_due_at: minutes(-4),
    created_at: hoursAgo(2),
    verdict: null,
    opencti_enrichment: {
      is_enriched: false,
    },
    raw_alert_ref: {
      agent_id: "011",
      agent_name: "EDGE-GATEWAY-01",
      rule_id: "5716",
      full_log: "sshd[2044]: Failed password for root from 203.0.113.9 port 51422 ssh2",
    },
  },
  {
    id: "cs_a41bd03",
    customer_id: "cust_globex_02",
    customer_name: "Globex Logistics",
    source: "wazuh",
    severity: 15,
    status: "escalated",
    assigned_analyst: { id: "an_02", name: "Chidinma Okafor" },
    title: "Ransomware Indicators on File Server",
    summary:
      "Mass file rename with .locked extension detected across shared drive within 90 seconds.",
    sla_due_at: minutes(3),
    created_at: hoursAgo(0.5),
    verdict: null,
    opencti_enrichment: {
      is_enriched: true,
      malware_family: "LockBit",
      confidence: 97,
      threat_actor: "LockBit Affiliate",
      indicators: [
        "198.51.100.23",
        "8f14e45fceea167a5a36dedd4bea2543",
      ],
    },
    raw_alert_ref: {
      agent_id: "022",
      agent_name: "FILESRV-LAGOS-01",
      rule_id: "100550",
      full_log: "550 files renamed with extension .locked in \\\\FILESRV-LAGOS-01\\shared",
    },
  },
  {
    id: "cs_701fbe4",
    customer_id: "cust_umbrella_03",
    customer_name: "Umbrella Pharma NG",
    source: "wazuh",
    severity: 3,
    status: "new",
    assigned_analyst: null,
    title: "Unusual Outbound DNS Query Volume",
    summary:
      "Workstation issued an abnormally high volume of DNS TXT record queries to an uncommon domain.",
    sla_due_at: minutes(45),
    created_at: hoursAgo(0.2),
    verdict: null,
    opencti_enrichment: {
      is_enriched: false,
    },
    raw_alert_ref: {
      agent_id: "033",
      agent_name: "WORKSTATION-LAB-07",
      rule_id: "533",
      full_log: "DNS query type=TXT count=340 domain=xj4np.example-tunnel.net",
    },
  },
  {
    id: "cs_5db2f18",
    customer_id: "cust_acme_01",
    customer_name: "Acme Bank - Victoria Island",
    source: "wazuh",
    severity: 9,
    status: "investigating",
    assigned_analyst: { id: "an_01", name: "Adesina Islam" },
    title: "Privilege Escalation via Scheduled Task",
    summary:
      "New scheduled task created running as SYSTEM shortly after a standard user login.",
    sla_due_at: minutes(120),
    created_at: hoursAgo(3),
    verdict: null,
    opencti_enrichment: {
      is_enriched: true,
      confidence: 55,
      indicators: ["C:\\Windows\\Temp\\svc_update.exe"],
    },
    raw_alert_ref: {
      agent_id: "004",
      agent_name: "WORKSTATION-FINANCE-02",
      rule_id: "18107",
      full_log: "schtasks /create /tn WinUpdateSvc /tr C:\\Windows\\Temp\\svc_update.exe /sc onlogon /ru SYSTEM",
    },
  },
  {
    id: "cs_ee019c7",
    customer_id: "cust_globex_02",
    customer_name: "Globex Logistics",
    source: "wazuh",
    severity: 4,
    status: "resolved",
    assigned_analyst: { id: "an_02", name: "Chidinma Okafor" },
    title: "Antivirus Detection Auto-Quarantined",
    summary:
      "Endpoint AV flagged and quarantined a known adware dropper on first execution.",
    sla_due_at: hoursAgo(-6),
    created_at: hoursAgo(30),
    verdict: {
      classification: "true_positive",
      notes:
        "AV quarantine confirmed effective. No lateral movement observed. Closed with no further action required.",
      customer_guidance:
        "No action needed. Our monitoring already blocked and removed the file automatically.",
    },
    opencti_enrichment: {
      is_enriched: true,
      malware_family: "Generic Adware",
      confidence: 62,
      indicators: ["a1b2c3d4e5f60718293a4b5c6d7e8f90"],
    },
    raw_alert_ref: {
      agent_id: "018",
      agent_name: "LAPTOP-SALES-14",
      rule_id: "7502",
      full_log: "AV quarantine: threat=Adware.Generic file=C:\\Users\\public\\setup_offer.exe",
    },
  },
  {
    id: "cs_c390a2d",
    customer_id: "cust_umbrella_03",
    customer_name: "Umbrella Pharma NG",
    source: "wazuh",
    severity: 11,
    status: "new",
    assigned_analyst: null,
    title: "Suspicious Lateral Movement via SMB",
    summary:
      "Admin share access from a workstation not typically used for administrative tasks.",
    sla_due_at: minutes(12),
    created_at: hoursAgo(0.1),
    verdict: null,
    opencti_enrichment: {
      is_enriched: false,
    },
    raw_alert_ref: {
      agent_id: "041",
      agent_name: "WORKSTATION-HR-03",
      rule_id: "92050",
      full_log: "SMB connection to ADMIN$ share from 10.20.4.18 to 10.20.4.5",
    },
  },
  {
    id: "cs_44a7b9e",
    customer_id: "cust_acme_01",
    customer_name: "Acme Bank - Victoria Island",
    source: "wazuh",
    severity: 2,
    status: "resolved",
    assigned_analyst: { id: "an_03", name: "Femi Adaeze" },
    title: "Password Policy Violation Alert",
    summary:
      "Multiple account lockouts due to repeated incorrect password entry by end user.",
    sla_due_at: hoursAgo(-40),
    created_at: hoursAgo(44),
    verdict: {
      classification: "benign",
      notes: "User confirmed forgotten password after returning from leave. No malicious activity.",
      customer_guidance:
        "No action required. This was a routine password lockout resolved by the user resetting their credentials.",
    },
    opencti_enrichment: null,
    raw_alert_ref: {
      agent_id: "007",
      agent_name: "WORKSTATION-OPS-19",
      rule_id: "5551",
      full_log: "Multiple failed logons for user jadeyemi, account locked",
    },
  },
];

export const mockCases: Case[] = rawMockCases.map((c) => ({
  ...c,
  risk_score: computeRiskScore(c.severity, c.opencti_enrichment?.confidence ?? 0),
}));

export const mockCaseEvents: Record<string, CaseEvent[]> = {
  cs_8f91a2b: [
    {
      id: "ev_1",
      case_id: "cs_8f91a2b",
      type: "assignment",
      message: "Case assigned to Adesina Islam",
      actor_name: "Adesina Islam",
      created_at: hoursAgo(0.9),
    },
    {
      id: "ev_2",
      case_id: "cs_8f91a2b",
      type: "status_change",
      message: "Status changed from new to investigating",
      actor_name: "Adesina Islam",
      created_at: hoursAgo(0.85),
    },
    {
      id: "ev_3",
      case_id: "cs_8f91a2b",
      type: "note",
      message: "Endpoint isolated pending further triage.",
      actor_name: "Adesina Islam",
      created_at: hoursAgo(0.5),
    },
  ],
  cs_a41bd03: [
    {
      id: "ev_4",
      case_id: "cs_a41bd03",
      type: "assignment",
      message: "Case assigned to Chidinma Okafor",
      actor_name: "Chidinma Okafor",
      created_at: hoursAgo(0.45),
    },
    {
      id: "ev_5",
      case_id: "cs_a41bd03",
      type: "escalation",
      message: "Escalated to senior lead: active ransomware indicators.",
      actor_name: "Chidinma Okafor",
      created_at: hoursAgo(0.2),
    },
  ],
  cs_ee019c7: [
    {
      id: "ev_6",
      case_id: "cs_ee019c7",
      type: "assignment",
      message: "Case assigned to Chidinma Okafor",
      actor_name: "Chidinma Okafor",
      created_at: hoursAgo(29),
    },
    {
      id: "ev_7",
      case_id: "cs_ee019c7",
      type: "verdict",
      message: "Verdict submitted: true_positive",
      actor_name: "Chidinma Okafor",
      created_at: hoursAgo(28),
    },
  ],
};

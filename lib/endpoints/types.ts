// GET /api/v1/endpoints — confirmed live. Analyst-only per-agent
// inventory, filterable by customer_id and status.
export interface EndpointItem {
  agent_id: string;
  name: string;
  ip: string;
  status: string;
  os_name: string;
  os_platform: string;
  version: string;
  branch_label: string;
  customer_id: string;
  customer_name: string;
  customer_slug: string;
  last_keepalive: string | null;
  date_add: string;
}

// GET /api/v1/audit/logs — confirmed live, wrapped in {data: [...]}, no
// documented query params or pagination envelope (just a flat array).
export interface AuditLogEntry {
  id: string;
  event_type: string;
  actor_email: string;
  target_type: string;
  target_id: string;
  ip_address: string | null;
  user_agent: string;
  request_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

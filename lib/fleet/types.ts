// /api/v1/fleet/* — confirmed live (added to the backend between the
// Oct 10 and Oct 11 schema snapshots). Responses are flat, not wrapped in
// {data: ...} like most of the rest of the API.

export type OsPlatform = "linux" | "windows" | "macos";

export type FleetDeviceStatus = "PENDING" | "ONLINE" | "ONBOARDING_FAILED" | "DISCONNECTED";

export interface EnrollmentToken {
  id: string;
  name: string;
  site_label: string;
  max_devices: number;
  devices_enrolled: number;
  expires_at: string;
  is_revoked: boolean;
  is_valid: boolean;
  created_at: string;
  // Schema types this as a plain string; the real response is an object
  // keyed by OS. Only present at all on the create response.
  install_commands: Record<OsPlatform, string>;
  // Only present on the create response — shown once, never refetchable.
  raw_token?: string;
}

export interface CreateEnrollmentTokenInput {
  name: string;
  site_label?: string;
  max_devices?: number;
  ttl_days?: number;
}

export interface FleetDevice {
  id: string;
  hostname: string;
  site_label: string;
  wazuh_name: string;
  wazuh_agent_id: string;
  ip_address: string;
  os_platform: string;
  status: FleetDeviceStatus;
  status_display: string;
  diagnostic_checklist: unknown;
  enrolled_at: string;
  last_heartbeat_at: string | null;
}

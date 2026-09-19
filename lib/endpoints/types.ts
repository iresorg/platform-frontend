export type EndpointStatus = "online" | "offline" | "isolated";

export interface Endpoint {
  id: string;
  agent_id: string;
  hostname: string;
  customer_id: string;
  customer_name: string;
  os: string;
  status: EndpointStatus;
  last_seen: string;
}

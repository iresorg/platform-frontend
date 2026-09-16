import type { AuthUser } from "@/lib/auth/types";

interface MockAccount {
  credentials: { email: string; password: string };
  user: AuthUser;
}

// Demo-only accounts, used while NEXT_PUBLIC_API_BASE_URL is unset.
export const mockAccounts: MockAccount[] = [
  {
    credentials: { email: "analyst@ires.com", password: "analyst123" },
    user: {
      id: "an_01",
      name: "Adesina Islam",
      email: "analyst@ires.com",
      role: "analyst",
    },
  },
  {
    credentials: { email: "lead@ires.com", password: "lead123" },
    user: {
      id: "an_02",
      name: "Chidinma Okafor",
      email: "lead@ires.com",
      role: "lead",
    },
  },
  {
    credentials: { email: "client@acme.com", password: "client123" },
    user: {
      id: "cu_01",
      name: "Bola Adeyemi",
      email: "client@acme.com",
      role: "customer",
      customer_id: "cust_acme_01",
    },
  },
];

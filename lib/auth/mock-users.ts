import type { AuthUser } from "@/lib/auth/types";

interface MockAccount {
  credentials: { email: string; password: string };
  user: AuthUser;
}

// Demo-only accounts, used while NEXT_PUBLIC_API_BASE_URL is unset.
export const mockAccounts: MockAccount[] = [
  {
    credentials: { email: "tier1@iresorg.com", password: "tier1pass123" },
    user: {
      id: "an_01",
      name: "Adesina Islam",
      email: "tier1@iresorg.com",
      role: "tier1",
    },
  },
  {
    credentials: { email: "tier2@iresorg.com", password: "tier2pass123" },
    user: {
      id: "an_02",
      name: "Chidinma Okafor",
      email: "tier2@iresorg.com",
      role: "tier2",
    },
  },
  {
    credentials: { email: "admin@iresorg.com", password: "adminpass123" },
    user: {
      id: "an_03",
      name: "Tunde Bakare",
      email: "admin@iresorg.com",
      role: "admin",
    },
  },
  {
    credentials: { email: "client@acme.com", password: "client123" },
    user: {
      id: "cu_01",
      name: "Bola Adeyemi",
      email: "client@acme.com",
      role: "tenant_user",
      customer_id: "cust_acme_01",
    },
  },
  {
    credentials: { email: "admin@acme.com", password: "client123" },
    user: {
      id: "cu_02",
      name: "Ngozi Eze",
      email: "admin@acme.com",
      role: "tenant_admin",
      customer_id: "cust_acme_01",
    },
  },
];

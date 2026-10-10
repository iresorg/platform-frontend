"use client";

// Stands in for GET/POST/PATCH /portal/users — see the backend asks
// list. The staff-side /tenants/:id/members is real but exposes the
// tenant ID in its URL, which the portal must never do (golden rule 4),
// so it can't be reused directly from a portal screen even though the
// underlying data likely already exists.

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mockDelay } from "@/lib/mocks/helpers";

export interface MockPortalUser {
  id: string;
  name: string;
  email: string;
  role: "tenant_user" | "tenant_admin";
  mfa_enrolled: boolean;
  status: "active" | "invited" | "disabled";
}

let users: MockPortalUser[] = [
  { id: "u1", name: "Bola Adeyemi", email: "client@acme.com", role: "tenant_user", mfa_enrolled: true, status: "active" },
  { id: "u2", name: "Ngozi Eze", email: "admin@acme.com", role: "tenant_admin", mfa_enrolled: true, status: "active" },
  { id: "u3", name: "Femi Lawal", email: "femi@acme.com", role: "tenant_user", mfa_enrolled: false, status: "invited" },
];

export function useMockPortalUsersQuery() {
  return useQuery({ queryKey: ["mock", "portal-users"], queryFn: () => mockDelay(users) });
}

export function useMockInvitePortalUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, role }: { email: string; role: MockPortalUser["role"] }) => {
      const user: MockPortalUser = { id: `u${users.length + 1}`, name: email.split("@")[0], email, role, mfa_enrolled: false, status: "invited" };
      users = [...users, user];
      return mockDelay(user);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["mock", "portal-users"] }),
  });
}

export function useMockChangePortalUserRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: MockPortalUser["role"] }) => {
      users = users.map((u) => (u.id === id ? { ...u, role } : u));
      return mockDelay(null);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["mock", "portal-users"] }),
  });
}

"use client";

import { RequirePermission } from "@/components/auth/require-permission";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth/auth-provider";
import { MockDataBanner } from "@/components/shared/mock-data-banner";
import { Button } from "@/components/ui/button";
import { ColorBadge } from "@/components/ui/color-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useMockChangePortalUserRoleMutation,
  useMockInvitePortalUserMutation,
  useMockPortalUsersQuery,
  type MockPortalUser,
} from "@/lib/mocks/portal-users";

function InviteDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MockPortalUser["role"]>("tenant_user");
  const invite = useMockInvitePortalUserMutation();

  async function submit() {
    if (!email.trim()) return;
    await invite.mutateAsync({ email: email.trim(), role });
    toast.success(`Invited ${email}.`);
    setEmail("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite a user</DialogTitle>
          <DialogDescription>They&rsquo;ll get an email to set up their account.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="invite-email">Email</Label>
            <Input id="invite-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="invite-role">Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as MockPortalUser["role"])}>
              <SelectTrigger id="invite-role"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tenant_user">User</SelectItem>
                <SelectItem value="tenant_admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" disabled={!email.trim() || invite.isPending} onClick={() => void submit()}>
            {invite.isPending ? "Inviting..." : "Send invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function PortalUsersPage() {
  const { user } = useAuth();
  const { data: users, isLoading } = useMockPortalUsersQuery();
  const changeRole = useMockChangePortalUserRoleMutation();
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <RequirePermission code="portal.user.manage">
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl">Users</h1>
          <p className="text-sm text-muted-foreground">People at your organization with portal access.</p>
        </div>
        <Button onClick={() => setInviteOpen(true)}><UserPlus aria-hidden="true" /> Invite user</Button>
      </div>

      <MockDataBanner endpoint="GET/POST/PATCH /portal/users" />

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col divide-y divide-border">
          {isLoading && <p className="p-5 text-sm text-muted-foreground">Loading...</p>}
          {users?.map((u) => {
            const isSelf = u.email === user?.email;
            return (
              <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div>
                  <p className="flex items-center gap-2 text-sm font-medium">
                    {u.name}
                    {isSelf && <ColorBadge tone="blue" variant="outline">You</ColorBadge>}
                    {!u.mfa_enrolled && <ColorBadge tone="amber" variant="outline">MFA not set up</ColorBadge>}
                  </p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <ColorBadge tone={u.status === "active" ? "emerald" : u.status === "invited" ? "blue" : "slate"} variant="outline">
                    {u.status}
                  </ColorBadge>
                  <Select
                    value={u.role}
                    disabled={isSelf}
                    onValueChange={(v) => changeRole.mutate({ id: u.id, role: v as MockPortalUser["role"] })}
                  >
                    <SelectTrigger size="sm" className="w-28" aria-label={`Role for ${u.name}`}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tenant_user">User</SelectItem>
                      <SelectItem value="tenant_admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} />
    </div>
    </RequirePermission>
  );
}

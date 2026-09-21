"use client";

import { useState } from "react";
import { Check, Copy, UserPlus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import { useInviteMemberMutation, useRevokeInvitationMutation } from "@/lib/tenants/queries";
import type { CreateInvitationResponse } from "@/lib/tenants/types";

const schema = z.object({ email: z.string().min(1, "Email is required.").email("Enter a valid email.") });
type Values = z.infer<typeof schema>;

export function InviteMemberDialog({ tenantId }: { tenantId: string }) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<CreateInvitationResponse | null>(null);
  const [copied, setCopied] = useState(false);
  const invite = useInviteMemberMutation(tenantId);
  const revoke = useRevokeInvitationMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  function close(next: boolean) {
    setOpen(next);
    if (!next) {
      setResult(null);
      setCopied(false);
      reset();
    }
  }

  async function onSubmit(values: Values) {
    try {
      setResult(await invite.mutateAsync(values));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't send the invitation.");
    }
  }

  const link = result ? `${window.location.origin}/invite/${result.invitation_token}` : "";

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — select the link and copy it manually.");
    }
  }

  async function revokeInvitation() {
    if (!result) return;
    try {
      const res = await revoke.mutateAsync(result.invitation.id);
      toast.success(res.message);
      close(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't revoke the invitation.");
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <UserPlus aria-hidden="true" />
        Invite member
      </Button>
      <Dialog open={open} onOpenChange={close}>
        <DialogContent className="sm:max-w-md">
          {result ? (
            <>
              <DialogHeader>
                <DialogTitle>Invitation created</DialogTitle>
                <DialogDescription>
                  Share this link with {result.invitation.email}. It&rsquo;s shown only once and
                  expires {new Date(result.invitation.expires_at).toLocaleDateString()}.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-2">
                <Input readOnly value={link} aria-label="Invitation link" onFocus={(e) => e.currentTarget.select()} />
                <Button type="button" variant="outline" onClick={() => void copyLink()}>
                  {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={revoke.isPending}
                  onClick={() => void revokeInvitation()}
                >
                  Revoke invitation
                </Button>
                <Button type="button" onClick={() => close(false)}>
                  Done
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Invite a member</DialogTitle>
                <DialogDescription>
                  They&rsquo;ll get a single-use link to join this organization.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="invite-email">Email</Label>
                  <Input id="invite-email" type="email" aria-invalid={!!errors.email} {...register("email")} />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => close(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Creating..." : "Create invitation"}
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

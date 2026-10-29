"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { SecretOnce } from "@/components/shared/secret-once";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInviteStaffMutation } from "@/lib/staff/queries";
import type { InviteStaffResponse } from "@/lib/staff/types";

export const TIER_LABELS = { tier1: "Tier 1", tier2: "Tier 2", admin: "Admin" } as const;

const schema = z.object({
  email: z.string().min(1, "Email is required.").email("Enter a valid email."),
  first_name: z.string().trim().max(150),
  last_name: z.string().trim().max(150),
  tier: z.enum(["tier1", "tier2", "admin"]),
  // Optional: blank means "email an invite link" rather than activate now.
  password: z.union([z.literal(""), z.string().min(8, "At least 8 characters.")]),
});
type Values = z.infer<typeof schema>;

export function InviteStaffDialog() {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<InviteStaffResponse | null>(null);
  const invite = useInviteStaffMutation();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", first_name: "", last_name: "", tier: "tier1", password: "" },
  });

  function close(next: boolean) {
    setOpen(next);
    if (!next) {
      setResult(null);
      reset();
    }
  }

  async function onSubmit(values: Values) {
    try {
      const res = await invite.mutateAsync({
        email: values.email,
        first_name: values.first_name || undefined,
        last_name: values.last_name || undefined,
        tier: values.tier,
        password: values.password || undefined,
      });
      if (res.invite_url) {
        setResult(res);
      } else {
        toast.success(`${res.name || res.email} added as ${TIER_LABELS[res.tier] ?? res.tier}.`);
        close(false);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't add that staff member.");
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <UserPlus aria-hidden="true" />
        Invite staff
      </Button>
      <Dialog open={open} onOpenChange={close}>
        <DialogContent className="sm:max-w-md">
          {result?.invite_url ? (
            <>
              <DialogHeader>
                <DialogTitle>Invitation sent</DialogTitle>
                <DialogDescription>
                  {result.email} has been emailed a link
                  {result.expires_at ? ` that expires ${new Date(result.expires_at).toLocaleString()}` : ""}. You can
                  also share it directly.
                </DialogDescription>
              </DialogHeader>
              <SecretOnce label="invite link" value={result.invite_url} />
              <DialogFooter>
                <Button type="button" onClick={() => close(false)}>
                  Done
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Invite a staff member</DialogTitle>
                <DialogDescription>
                  Leave the password blank to email them a 72-hour invite link, or set one to activate the account
                  now.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="staff-email">Email</Label>
                  <Input id="staff-email" type="email" aria-invalid={!!errors.email} {...register("email")} />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="staff-first">First name</Label>
                    <Input id="staff-first" {...register("first_name")} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="staff-last">Last name</Label>
                    <Input id="staff-last" {...register("last_name")} />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label id="staff-tier-label">Tier</Label>
                  <Controller
                    control={control}
                    name="tier"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger aria-labelledby="staff-tier-label">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(TIER_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="staff-password">Password (optional)</Label>
                  <Input
                    id="staff-password"
                    type="password"
                    autoComplete="new-password"
                    aria-invalid={!!errors.password}
                    {...register("password")}
                  />
                  {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => close(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add staff member"}
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

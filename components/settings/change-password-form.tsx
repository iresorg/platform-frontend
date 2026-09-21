"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChangePasswordMutation } from "@/lib/auth/real-queries";

const schema = z
  .object({
    old_password: z.string().min(1, "Enter your current password."),
    new_password: z.string().min(8, "Use at least 8 characters."),
    confirm: z.string().min(1, "Confirm your new password."),
  })
  .refine((v) => v.new_password === v.confirm, {
    path: ["confirm"],
    message: "Passwords don't match.",
  });

type Values = z.infer<typeof schema>;

const FIELDS: { name: keyof Values; label: string; autoComplete: string }[] = [
  { name: "old_password", label: "Current password", autoComplete: "current-password" },
  { name: "new_password", label: "New password", autoComplete: "new-password" },
  { name: "confirm", label: "Confirm new password", autoComplete: "new-password" },
];

export function ChangePasswordForm() {
  const mutation = useChangePasswordMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Values) {
    try {
      const res = await mutation.mutateAsync({
        old_password: values.old_password,
        new_password: values.new_password,
      });
      toast.success(res.message);
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't change the password.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-sm flex-col gap-4" noValidate>
      {FIELDS.map(({ name, label, autoComplete }) => (
        <div key={name} className="flex flex-col gap-1.5">
          <Label htmlFor={`pw-${name}`}>{label}</Label>
          <Input
            id={`pw-${name}`}
            type="password"
            autoComplete={autoComplete}
            aria-invalid={!!errors[name]}
            {...register(name)}
          />
          {errors[name] && <p className="text-xs text-destructive">{errors[name]?.message}</p>}
        </div>
      ))}
      <Button type="submit" disabled={isSubmitting} className="self-start">
        {isSubmitting ? "Updating..." : "Update password"}
      </Button>
    </form>
  );
}

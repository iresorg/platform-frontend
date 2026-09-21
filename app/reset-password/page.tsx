"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api-error";
import { useResetPasswordMutation } from "@/lib/auth/real-queries";

const schema = z
  .object({
    token: z.string().trim().min(1, "Paste the token from your reset email."),
    new_password: z.string().min(8, "Use at least 8 characters."),
    confirm: z.string().min(1, "Confirm your new password."),
  })
  .refine((v) => v.new_password === v.confirm, { path: ["confirm"], message: "Passwords don't match." });
type Values = z.infer<typeof schema>;

function ResetPasswordForm() {
  const router = useRouter();
  const tokenFromLink = useSearchParams().get("token") ?? "";
  const mutation = useResetPasswordMutation();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { token: tokenFromLink } });

  async function onSubmit(values: Values) {
    setFormError(null);
    try {
      await mutation.mutateAsync({ token: values.token, new_password: values.new_password });
      router.replace("/login?reset=1");
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <AuthSplitLayout
      headline="Choose a new password."
      description="Resetting signs you out everywhere, so anyone who had access to your old password loses it."
    >
      <div className="flex flex-col gap-1.5">
        <h2 className="text-3xl">New password</h2>
        <p className="text-sm text-muted-foreground">Set a new password for your account.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        {!tokenFromLink && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="token" className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
              Reset token
            </Label>
            <Input id="token" className="h-11 font-mono text-xs" aria-invalid={!!errors.token} {...register("token")} />
            {errors.token && <p className="text-xs text-destructive">{errors.token.message}</p>}
          </div>
        )}
        {tokenFromLink && <input type="hidden" {...register("token")} />}
        {[
          { name: "new_password" as const, label: "New password" },
          { name: "confirm" as const, label: "Confirm new password" },
        ].map(({ name, label }) => (
          <div key={name} className="flex flex-col gap-1.5">
            <Label htmlFor={name} className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
              {label}
            </Label>
            <Input id={name} type="password" autoComplete="new-password" className="h-11" aria-invalid={!!errors[name]} {...register(name)} />
            {errors[name] && <p className="text-xs text-destructive">{errors[name]?.message}</p>}
          </div>
        ))}
        {formError && (
          <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </p>
        )}
        <Button type="submit" disabled={isSubmitting} size="lg" className="mt-1 h-11 text-sm">
          {isSubmitting ? "Updating..." : "Update password"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthSplitLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}

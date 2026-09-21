"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api-error";
import { useForgotPasswordMutation } from "@/lib/auth/real-queries";

const schema = z.object({
  email: z.string().min(1, "Email is required.").email("Enter a valid email."),
});
type Values = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const mutation = useForgotPasswordMutation();
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  async function onSubmit(values: Values) {
    setFormError(null);
    try {
      // The response also carries the reset token itself. It's deliberately
      // ignored: the reset link is meant to arrive by email, and using the
      // inline token would let this page reset any account from just an
      // email address.
      const res = await mutation.mutateAsync(values);
      setSentMessage(res.message);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <AuthSplitLayout
      headline="Locked out? We'll get you back in."
      description="Enter the email you registered with and we'll send instructions to reset your password."
    >
      <div className="flex flex-col gap-1.5">
        <h2 className="text-3xl">Reset your password</h2>
        <p className="text-sm text-muted-foreground">We&rsquo;ll email you a reset link.</p>
      </div>

      {sentMessage ? (
        <div className="flex flex-col gap-5">
          <p role="status" className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            {sentMessage}
          </p>
          <Button asChild variant="outline" size="lg" className="h-11">
            <Link href="/login">Back to sign in</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
              Email
            </Label>
            <Input id="email" type="email" autoComplete="email" className="h-11" aria-invalid={!!errors.email} {...register("email")} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          {formError && (
            <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {formError}
            </p>
          )}
          <Button type="submit" disabled={isSubmitting} size="lg" className="mt-1 h-11 text-sm">
            {isSubmitting ? "Sending..." : "Send reset link"}
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthSplitLayout>
  );
}

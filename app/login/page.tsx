"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuth } from "@/components/auth/auth-provider";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { USE_MOCK_AUTH } from "@/lib/config";
import { mockAccounts } from "@/lib/auth/mock-users";
import { ApiError } from "@/lib/api-error";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required.").email("Enter a valid email."),
  password: z.string().min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const justRegisteredOrg = searchParams.get("registered") === "1"
    ? searchParams.get("org")
    : null;
  const passwordWasReset = searchParams.get("reset") === "1";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginFormValues) {
    setFormError(null);
    try {
      const user = await login(values);
      const from = searchParams.get("from");
      const roleHome = user.role === "customer" ? "/portal" : "/cases";
      router.replace(from && from.startsWith("/") ? from : roleHome);
    } catch (err) {
      setFormError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again."
      );
    }
  }

  return (
    <AuthSplitLayout
      headline="Triage every alert before the SLA runs out."
      description="One case pipeline connecting Wazuh detections and OpenCTI intelligence — full context for analysts inside, plain-language updates for clients outside."
    >
      <div className="flex flex-col gap-1.5">
        <h2 className="text-3xl">Sign in</h2>
        <p className="text-sm text-muted-foreground">
          Your role decides which workspace loads.
        </p>
      </div>

      {passwordWasReset && (
        <p
          role="status"
          className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
        >
          Password updated. Sign in with your new password.
        </p>
      )}

      {justRegisteredOrg && (
        <p
          role="status"
          className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
        >
          Workspace &ldquo;{justRegisteredOrg}&rdquo; created. Sign in with the
          email and password you just registered.
        </p>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
        noValidate
      >
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="email"
            className="text-xs font-bold tracking-wide text-muted-foreground uppercase"
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className="h-11"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
          {errors.email && (
            <p id="email-error" className="text-xs text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="password"
              className="text-xs font-bold tracking-wide text-muted-foreground uppercase"
            >
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              className="h-11 pr-10"
              aria-invalid={!!errors.password}
              aria-describedby={
                errors.password ? "password-error" : undefined
              }
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={
                showPassword ? "Hide password" : "Show password"
              }
              aria-pressed={showPassword}
              className="absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 text-muted-foreground transition-colors hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {errors.password && (
            <p id="password-error" className="text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>
        {formError && (
          <p
            role="alert"
            className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {formError}
          </p>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          size="lg"
          className="mt-1 h-11 text-sm"
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        New organization?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Register your organization
        </Link>
      </p>

      {USE_MOCK_AUTH && (
        <div className="rounded-xl border border-border bg-muted/60 px-4 py-3 text-xs text-muted-foreground">
          <p className="mb-1.5 font-bold text-secondary-foreground">
            No backend connected — demo accounts
          </p>
          <ul className="space-y-1 font-mono">
            {mockAccounts.map((account) => (
              <li key={account.credentials.email}>
                <span className="font-bold text-foreground">
                  {account.user.role}
                </span>
                : {account.credentials.email} /{" "}
                {account.credentials.password}
              </li>
            ))}
          </ul>
        </div>
      )}
    </AuthSplitLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuth } from "@/components/auth/auth-provider";
import { Wordmark } from "@/components/brand/wordmark";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { USE_MOCK_API } from "@/lib/config";
import { mockAccounts } from "@/lib/auth/mock-users";
import { ApiError } from "@/lib/api-error";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required.").email("Enter a valid email."),
  password: z.string().min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="grid flex-1 lg:grid-cols-2">
      {/* Brand panel — fixed brand navy regardless of light/dark mode */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-brand-navy px-12 py-10 text-white lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -right-32 size-96 rounded-full bg-brand-red/20 blur-3xl"
        />

        <Wordmark inverted className="relative w-10 h-9" />

        <div className="relative flex max-w-md flex-col gap-5">
          <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-bold tracking-wide text-white/80 uppercase">
            24/7 SOC Platform
          </span>
          <h1 className="text-4xl leading-tight font-bold text-white sm:text-5xl">
            Triage every alert before the SLA runs out.
          </h1>
          <p className="text-base leading-relaxed text-white/70">
            One case pipeline connecting Wazuh detections and OpenCTI
            intelligence — full context for analysts inside, plain-language
            updates for clients outside.
          </p>
        </div>

        <p className="relative text-xs text-white/50">
          © 2026 iRES — Incident Response &amp; Emergency Service
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col overflow-y-auto px-6 py-8 sm:px-12">
        <div className="flex items-center justify-between lg:justify-end">
          <div className="lg:hidden">
            <Wordmark className="h-7" />
          </div>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 flex-col justify-center">
          <div className="mx-auto flex w-full max-w-sm flex-col gap-8">
            <div className="flex flex-col gap-1.5">
              <h2 className="text-3xl">Sign in</h2>
              <p className="text-sm text-muted-foreground">
                Your role decides which workspace loads.
              </p>
            </div>

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
                <Label
                  htmlFor="password"
                  className="text-xs font-bold tracking-wide text-muted-foreground uppercase"
                >
                  Password
                </Label>
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

            {USE_MOCK_API && (
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
          </div>
        </div>
      </div>
    </div>
  );
}

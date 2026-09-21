"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api-error";
import { register as registerOrg, verifyEmail } from "@/lib/auth/real-api";

const registerSchema = z.object({
  organization_name: z.string().trim().min(1, "Organization name is required."),
  first_name: z.string().trim().min(1, "First name is required."),
  last_name: z.string().trim().min(1, "Last name is required."),
  email: z.string().min(1, "Email is required.").email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(values: RegisterFormValues) {
    setFormError(null);
    try {
      const result = await registerOrg(values);
      // The verification token is handed back directly in the response
      // (rather than only emailed), so we can complete verification right
      // away instead of requiring a real inbox in this environment.
      try {
        await verifyEmail({ token: result.verification_token });
      } catch {
        // Non-fatal — the account still exists even if auto-verify fails;
        // they can verify later through whatever real flow replaces this.
      }
      router.replace(
        `/login?registered=1&org=${encodeURIComponent(result.tenant.slug)}`
      );
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
      headline="Onboard your organization for round-the-clock protection."
      description="Register once to create your organization’s workspace — your security team gets full visibility, you get plain-language updates."
    >
      <div className="flex flex-col gap-1.5">
        <h2 className="text-3xl">Register your organization</h2>
        <p className="text-sm text-muted-foreground">
          Creates a workspace for your organization on the live backend.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
        noValidate
      >
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="organization_name"
            className="text-xs font-bold tracking-wide text-muted-foreground uppercase"
          >
            Organization name
          </Label>
          <Input
            id="organization_name"
            className="h-11"
            aria-invalid={!!errors.organization_name}
            {...register("organization_name")}
          />
          {errors.organization_name && (
            <p className="text-xs text-destructive">
              {errors.organization_name.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="first_name"
              className="text-xs font-bold tracking-wide text-muted-foreground uppercase"
            >
              First name
            </Label>
            <Input
              id="first_name"
              className="h-11"
              aria-invalid={!!errors.first_name}
              {...register("first_name")}
            />
            {errors.first_name && (
              <p className="text-xs text-destructive">
                {errors.first_name.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="last_name"
              className="text-xs font-bold tracking-wide text-muted-foreground uppercase"
            >
              Last name
            </Label>
            <Input
              id="last_name"
              className="h-11"
              aria-invalid={!!errors.last_name}
              {...register("last_name")}
            />
            {errors.last_name && (
              <p className="text-xs text-destructive">
                {errors.last_name.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="email"
            className="text-xs font-bold tracking-wide text-muted-foreground uppercase"
          >
            Work email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className="h-11"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
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
              autoComplete="new-password"
              className="h-11 pr-10"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
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
            <p className="text-xs text-destructive">{errors.password.message}</p>
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
          {isSubmitting ? "Creating workspace..." : "Create workspace"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already registered?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthSplitLayout>
  );
}

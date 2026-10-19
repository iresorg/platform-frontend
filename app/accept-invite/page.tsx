"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuth } from "@/components/auth/auth-provider";
import { AuthHeading, AuthSplitLayout, authButtonClass, authInputClass, authLabelClass } from "@/components/auth/auth-split-layout";
import { AppLoadingScreen } from "@/components/shared/app-loading-screen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api-error";
import { acceptInvite, getInvitePreview, type InvitePreview } from "@/lib/auth/invite-api";
import { roleHome } from "@/lib/auth/roles";

const EYEBROW = "CLIENT PORTAL";
const HEADLINE = "Your security team is already watching.";
const DESCRIPTION = "Set a password to see your devices, incidents and plain-language guidance — nothing technical, just what matters to you.";

const schema = z
  .object({
    password: z.string().min(8, "Use at least 8 characters."),
    confirm: z.string().min(1, "Confirm your password."),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Passwords don't match." });
type Values = z.infer<typeof schema>;

type LinkState = "loading" | "valid" | "expired";

function AcceptInviteForm() {
  const router = useRouter();
  const { refreshSession } = useAuth();
  const token = useSearchParams().get("token") ?? "";
  const [linkState, setLinkState] = useState<LinkState>("loading");
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  useEffect(() => {
    // Strip the token from the address bar the moment the page loads —
    // it should never end up in logs, analytics or browser history.
    if (typeof window !== "undefined" && window.location.search) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    getInvitePreview(token)
      .then((data) => {
        if (cancelled) return;
        setPreview(data);
        setLinkState("valid");
      })
      .catch((err) => {
        if (cancelled) return;
        // Any failure here — 410, 404, network — reads as an invalid
        // link; there's nothing else useful to distinguish for the user.
        setLinkState("expired");
        void err;
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function onSubmit(values: Values) {
    setFormError(null);
    try {
      const data = await acceptInvite({ token, password: values.password });
      if (!data.access_token) {
        throw new ApiError("The invite was accepted but the server returned no access token.", 500);
      }
      const user = await refreshSession(data.access_token);
      router.replace(roleHome(user.role));
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    }
  }

  const effectiveState: LinkState = !token ? "expired" : linkState;

  if (effectiveState === "loading") {
    return (
      <AuthSplitLayout eyebrow={EYEBROW} headline={HEADLINE} description={DESCRIPTION}>
        <AuthHeading eyebrow="ONE MOMENT" title="Checking your invite..." subtitle="" />
      </AuthSplitLayout>
    );
  }

  if (effectiveState === "expired") {
    return (
      <AuthSplitLayout eyebrow={EYEBROW} headline={HEADLINE} description={DESCRIPTION}>
        <AuthHeading eyebrow="INVITE LINK" title="This link isn't valid" subtitle="" />
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          This invite link has expired or was already used. Ask your iRES contact for a new one.
        </p>
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      </AuthSplitLayout>
    );
  }

  return (
    <AuthSplitLayout eyebrow={EYEBROW} headline={HEADLINE} description={DESCRIPTION}>
      <AuthHeading
        eyebrow="SET YOUR PASSWORD"
        title={`Welcome, ${preview?.customer_name ?? ""}`}
        subtitle="Choose a password to finish setting up your account."
      />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" className={authLabelClass}>
            Email
          </Label>
          <Input id="email" value={preview?.email ?? ""} readOnly disabled className={authInputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password" className={authLabelClass}>
            New password
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            className={authInputClass}
            aria-invalid={!!errors.password}
            aria-describedby="password-rules"
            {...register("password")}
          />
          <p id="password-rules" className="text-xs text-muted-foreground">At least 8 characters.</p>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirm" className={authLabelClass}>
            Confirm password
          </Label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            className={authInputClass}
            aria-invalid={!!errors.confirm}
            {...register("confirm")}
          />
          {errors.confirm && <p className="text-xs text-destructive">{errors.confirm.message}</p>}
        </div>
        {formError && (
          <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {formError}
          </p>
        )}
        <Button type="submit" disabled={isSubmitting} size="lg" className={`mt-1 ${authButtonClass}`}>
          {isSubmitting ? "Setting up your account..." : "Set password and sign in"}
        </Button>
      </form>
    </AuthSplitLayout>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<AppLoadingScreen />}>
      <AcceptInviteForm />
    </Suspense>
  );
}

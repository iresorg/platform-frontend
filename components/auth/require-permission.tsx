"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { useCan } from "@/hooks/use-can";
import { AppLoadingScreen } from "@/components/shared/app-loading-screen";
import { roleHome } from "@/lib/auth/roles";

// Layer (b) of the guide's three-layer gating (1.5): navigation hides a
// screen a tier can't open, this sends them to their landing page with a
// notice if they type the URL anyway. Every screen gated by anything
// above the "all staff" bar (compliance.read, ai.review, tenant.read,
// report.manage, audit.read, user.manage, and the portal-admin-only
// keys) needs this — without it, hiding the nav link is only a
// decoration, not a restriction.
export function RequirePermission({
  code,
  children,
}: {
  code: string;
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const can = useCan();
  const router = useRouter();
  const allowed = can(code);

  useEffect(() => {
    if (isLoading || !user || allowed) return;
    router.replace(roleHome(user.role));
  }, [isLoading, user, allowed, router]);

  if (isLoading || !user) return <AppLoadingScreen />;

  if (!allowed) {
    return (
      <div role="status" className="flex flex-1 flex-col items-center justify-center gap-2 p-16 text-center">
        <p className="font-heading text-lg font-bold">You don&rsquo;t have access to that page</p>
        <p className="text-sm text-muted-foreground">Taking you back to your home screen.</p>
      </div>
    );
  }

  return <>{children}</>;
}

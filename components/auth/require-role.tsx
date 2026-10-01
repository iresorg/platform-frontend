"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { AppLoadingScreen } from "@/components/shared/app-loading-screen";
import { roleHome } from "@/lib/auth/roles";
import type { UserRole } from "@/lib/auth/types";

export function RequireRole({
  roles,
  children,
}: {
  roles: UserRole[];
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const rolesKey = roles.join(",");

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!rolesKey.split(",").includes(user.role)) {
      router.replace(roleHome(user.role));
    }
  }, [isLoading, user, router, rolesKey]);

  if (isLoading || !user || !roles.includes(user.role)) {
    return <AppLoadingScreen />;
  }

  return <>{children}</>;
}

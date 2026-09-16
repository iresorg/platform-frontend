"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
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
      router.replace(user.role === "customer" ? "/portal" : "/cases");
    }
  }, [isLoading, user, router, rolesKey]);

  if (isLoading || !user || !roles.includes(user.role)) {
    return (
      <div
        role="status"
        className="flex flex-1 items-center justify-center p-16 text-sm text-muted-foreground"
      >
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}

"use client";

import Link from "next/link";
import { LogOut, UserCog, Users } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { useCan } from "@/hooks/use-can";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const initials = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : parts;
  return initials.map((p) => p[0]).join("").toUpperCase();
}

export function UserMenu({ subtitle }: { subtitle?: string }) {
  const { user, logout } = useAuth();
  const can = useCan();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className="cursor-pointer rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Avatar className="border border-white/25">
          <AvatarFallback className="bg-white/10 text-xs font-bold text-white">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5 font-normal">
          <span className="text-sm font-medium">{user.name}</span>
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings/account">
            <UserCog aria-hidden="true" />
            Account
          </Link>
        </DropdownMenuItem>
        {can("members.view") && (
          <DropdownMenuItem asChild>
            <Link href="/settings/team">
              <Users aria-hidden="true" />
              Team
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={logout}>
          <LogOut aria-hidden="true" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

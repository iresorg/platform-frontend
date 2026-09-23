"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme/theme-provider";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      className={className}
      onClick={toggleTheme}
    >
      <Sun
        className={theme === "dark" ? "hidden" : ""}
        suppressHydrationWarning
      />
      <Moon
        className={theme === "dark" ? "" : "hidden"}
        suppressHydrationWarning
      />
    </Button>
  );
}

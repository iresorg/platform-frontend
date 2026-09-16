import Image from "next/image";
import { cn } from "cn";

/**
 * iRES shield mark. The PNG is full-color (navy + Signal Red) for light
 * surfaces. `inverted` forces the brand guide's white-knockout treatment
 * (brightness-0 + invert turns the whole mark solid white, red included —
 * matching the guide's dark-background lockup) for permanently-navy
 * surfaces. On surfaces that follow the light/dark toggle, the same filter
 * kicks in automatically in dark mode so the navy wordmark stays legible.
 */
export function Wordmark({
  className,
  inverted = false,
}: {
  className?: string;
  inverted?: boolean;
}) {
  return (
    <Image
      src="/iRES-logo.png"
      alt="iRES"
      width={283}
      height={200}
      priority
      className={cn(
        "h-8 w-auto",
        inverted ? "brightness-0 invert" : "dark:brightness-0 dark:invert",
        className
      )}
    />
  );
}

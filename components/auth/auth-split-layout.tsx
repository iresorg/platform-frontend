import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Wordmark } from "@/components/brand/wordmark";
import { ThemeToggle } from "@/components/theme-toggle";

// Shared chrome for every signed-out screen: brand panel on the left
// (fixed navy in both themes), form column on the right.
export function AuthSplitLayout({
  headline,
  description,
  children,
}: {
  headline: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid flex-1 lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-brand-navy px-12 py-10 text-white lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -right-32 size-96 rounded-full bg-brand-red/20 blur-3xl"
        />

        <Wordmark inverted className="relative h-9 w-10" />

        <div className="relative flex max-w-md flex-col gap-5">
          <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-bold tracking-wide text-white/80 uppercase">
            24/7 SOC Platform
          </span>
          <h1 className="text-4xl leading-tight font-bold text-white sm:text-5xl">{headline}</h1>
          <p className="text-base leading-relaxed text-white/70">{description}</p>
        </div>

        <p className="relative text-xs text-white/50">
          © 2026 iRES — Incident Response &amp; Emergency Service
        </p>
      </div>

      <div className="flex flex-col overflow-y-auto px-6 py-8 sm:px-12">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back
          </Link>
          <div className="flex items-center gap-3">
            <div className="lg:hidden">
              <Wordmark className="h-7" />
            </div>
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center">
          <div className="mx-auto flex w-full max-w-sm flex-col gap-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

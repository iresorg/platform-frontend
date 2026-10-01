import Link from "next/link";
import { Wordmark } from "@/components/brand/wordmark";
import { SecurityIllustration } from "@/components/auth/security-illustration";
import { ThemeToggle } from "@/components/theme-toggle";

// Shared class strings for every auth page's form controls, so the look
// stays in one place instead of five near-identical copies.
export const authLabelClass = "text-sm font-medium text-foreground/85";
export const authInputClass =
  "h-12 rounded-xl border-0 bg-muted px-4 text-base placeholder:text-muted-foreground/70 focus-visible:bg-card focus-visible:ring-2 focus-visible:ring-ring";
export const authButtonClass =
  "h-12 rounded-xl bg-ires-red text-base font-semibold text-white hover:bg-ires-red/90 focus-visible:ring-ires-red/40";

// The small red-on-eyebrow / bold-heading / muted-subtext block every auth
// form opens with.
export function AuthHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-bold tracking-[0.12em] text-ires-red uppercase">{eyebrow}</span>
      <h1 className="font-sans text-4xl font-extrabold tracking-tight text-heading">{title}</h1>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

// Shared chrome for every signed-out screen: a form column that follows the
// viewer's theme, and a fixed-navy visual column carrying the brand
// illustration and a short pitch. The visual column drops out on mobile.
export function AuthSplitLayout({
  eyebrow = "SECURITY PLATFORM",
  headline,
  description,
  children,
}: {
  eyebrow?: string;
  headline: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid flex-1 bg-background lg:grid-cols-2">
      <div className="flex flex-col overflow-y-auto px-6 py-6 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between">
          <Link href="/" className="shrink-0">
            <Wordmark className="h-8 w-auto" />
          </Link>
          <ThemeToggle className="rounded-xl border border-border" />
        </div>

        <div className="flex flex-1 flex-col justify-center py-10">
          <div className="mx-auto flex w-full max-w-sm flex-col gap-8">{children}</div>
        </div>
      </div>

      <div className="relative hidden flex-col items-center justify-between overflow-hidden bg-navy px-10 py-10 text-white lg:flex">
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
          className="pointer-events-none absolute -top-32 -left-24 size-96 rounded-full bg-brand-red/25 blur-3xl"
        />

        <div className="relative flex w-full justify-end">
          <Wordmark inverted className="h-7 w-auto opacity-90" />
        </div>

        <SecurityIllustration className="relative" />

        <div className="relative flex max-w-md flex-col items-center gap-3 text-center">
          <span className="text-xs font-bold tracking-[0.16em] text-sky uppercase">{eyebrow}</span>
          <h2 className="font-sans text-2xl leading-snug font-bold text-white sm:text-[1.75rem]">{headline}</h2>
          <p className="sr-only">{description}</p>
        </div>
      </div>
    </div>
  );
}

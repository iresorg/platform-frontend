import Link from "next/link";
import { ShieldCheck, Radar, MessageSquareText } from "lucide-react";
import { Wordmark } from "@/components/brand/wordmark";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const FEATURES = [
  {
    icon: Radar,
    title: "Multi-tenant triage",
    description:
      "Every alert scored, queued, and SLA-tracked the moment it lands.",
  },
  {
    icon: ShieldCheck,
    title: "OpenCTI context",
    description:
      "Confidence-scored threat intel attached to every case, in one view.",
  },
  {
    icon: MessageSquareText,
    title: "Plain-language updates",
    description:
      "Clients see clear guidance in the portal — never raw logs or rule IDs.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-border px-6 py-4 sm:px-10">
        <Wordmark className="h-8" />
        <ThemeToggle />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-20 text-center sm:px-10">
        <div className="flex flex-col items-center gap-6">
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold tracking-wide text-secondary-foreground uppercase">
            24/7 Cyber Emergency Response
          </span>
          <h1 className="max-w-2xl text-4xl leading-tight sm:text-5xl">
            Fast, coordinated incident response — for every client, every
            time.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            One case pipeline connecting your SOC analysts to your clients:
            full technical context inside, plain-language guidance outside.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/login">Analyst sign in</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/portal">Customer portal</Link>
            </Button>
          </div>
        </div>

        <div className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-5 text-center shadow-sm"
            >
              <div className="flex size-10 items-center justify-center rounded-full bg-brand-navy/10 text-brand-navy dark:bg-brand-navy/20 dark:text-[#8b8fe8]">
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <p className="font-heading font-bold">{title}</p>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

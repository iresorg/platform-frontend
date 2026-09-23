import { AlertTriangle, FolderKanban, Radar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Reveal } from "@/components/landing/reveal";

const COVERAGE = [
  {
    icon: Radar,
    title: "L1 — SOC Triage",
    description:
      "Fast, high-volume first response - the queue an analyst works through case by case.",
  },
  {
    icon: AlertTriangle,
    title: "L2 — Security Analyst",
    description:
      "Deeper investigation and containment on the cases that need more than a first look.",
  },
  {
    icon: FolderKanban,
    title: "L3 — Incident Command",
    description:
      "Command-level coordination on major incidents, plus the org-wide view no single queue provides.",
  },
];

export function CoverageGrid() {
  return (
    <section className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold tracking-wide text-brand-red uppercase">
            The model
          </span>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Built on the Three-Level Responder Model
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            L1, L2, and L3 aren&apos;t filtered views of the same screen - they&apos;re
            different jobs, with different queues and different context, all reading
            from the same underlying case.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {COVERAGE.map(({ icon: Icon, title, description }, i) => (
            <Reveal key={title} delay={i * 0.05}>
              <Card className="h-full ring-border/60">
                <CardHeader>
                  <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-brand-navy/10 text-brand-navy dark:bg-brand-navy/20 dark:text-[#8b8fe8]">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-lg">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

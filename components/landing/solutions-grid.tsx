import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";

const SOLUTIONS = [
  {
    title: "Run 24/7 triage without a 24/7 headcount",
    description:
      "Live alert refresh and SLA countdowns mean nothing waits for someone to remember to check.",
  },
  {
    title: "Give every client their own view",
    description:
      "Multi-tenant by design — each organization only ever sees its own cases, never another client's.",
  },
  {
    title: "Onboard a new client in minutes",
    description:
      "Register an organization, invite the team, assign roles. No manual provisioning.",
  },
  {
    title: "Keep analysts inside SLA",
    description:
      "Risk-scored queues surface what matters first, with the clock visible on every open case.",
  },
  {
    title: "Turn detections into a defensible record",
    description:
      "Every escalation, note, and status change is timestamped on the incident timeline.",
  },
  {
    title: "Stop translating logs into email updates",
    description:
      "The customer portal is the update — plain language, generated from the same case data.",
  },
];

export function SolutionsGrid() {
  return (
    <section id="solutions" className="bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold tracking-wide text-brand-red uppercase">
            Solutions
          </span>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Built for how a SOC actually runs.
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {SOLUTIONS.map(({ title, description }, i) => (
            <Reveal key={title} delay={i * 0.04} className="h-full">
              <Link
                href="/register"
                className="group flex h-full flex-col gap-3 bg-card p-7 transition-colors hover:bg-muted/60"
              >
                <ArrowUpRight className="size-5 text-brand-red transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                <p className="font-heading text-base font-bold">{title}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

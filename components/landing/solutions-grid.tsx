import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";

const SOLUTIONS = [
  {
    title: "For SOC analysts",
    description:
      "Tiered L1/L2/L3 dashboards - each a genuinely different job, not a filtered view of the same screen.",
  },
  {
    title: "For the organization protected",
    description:
      "A customer portal with plain-language status - never raw severity codes, IOC values, or analyst names.",
  },
  {
    title: "For leadership",
    description:
      "Org-wide oversight through one super-admin view: every tier, every account, one place.",
  },
];

export function SolutionsGrid() {
  return (
    <section id="solutions" className="bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold tracking-wide text-brand-red uppercase">
            Roles
          </span>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Built for every role in the loop
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {SOLUTIONS.map(({ title, description }, i) => (
            <Reveal key={title} delay={i * 0.04} className="h-full">
              <Link
                href="/login"
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

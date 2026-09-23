import { Quote } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";

const QUOTES = [
  {
    quote: "Correlates real signals across your environment instead of firing on every raw event.",
    role: "Detection",
  },
  {
    quote:
      "A human chain of custody, not just an alert log - every handoff between tiers has a person and a reason attached.",
    role: "Escalation",
  },
  {
    quote:
      "A full audit trail from first signal to close, reviewable long after the incident is over.",
    role: "Accountability",
  },
];

export function PersonaQuotes() {
  return (
    <section className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold tracking-wide text-brand-red uppercase">
            Core
          </span>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            What iRES actually does
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {QUOTES.map(({ quote, role }, i) => (
            <Reveal key={role} delay={i * 0.06}>
              <figure className="flex h-full flex-col gap-5 rounded-2xl border border-border bg-card p-7">
                <Quote className="size-6 text-brand-red/70" aria-hidden="true" />
                <blockquote className="flex-1 text-sm leading-relaxed text-foreground">
                  {quote}
                </blockquote>
                <figcaption className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
                  {role}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

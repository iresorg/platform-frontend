import { Quote } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";

const QUOTES = [
  {
    quote:
      "“What I need at 2am isn't more dashboards — it's one queue, sorted by what actually matters.”",
    role: "SOC Analyst",
  },
  {
    quote:
      "“Every client asks the same question: what happened, and are we okay. The portal answers both without me writing an email.”",
    role: "SOC Lead",
  },
  {
    quote:
      "“Onboarding a new client used to mean a week of setup. Now it's a registration form and an invite link.”",
    role: "MSP Owner",
  },
];

export function PersonaQuotes() {
  return (
    <section className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold tracking-wide text-brand-red uppercase">
            Built for the people using it
          </span>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            The problems iRES was actually built to solve.
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

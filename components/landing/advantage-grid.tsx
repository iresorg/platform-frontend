import { Layers, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Reveal } from "@/components/landing/reveal";
import { SectionBackdrop } from "@/components/landing/section-backdrop";

const ADVANTAGES = [
  {
    icon: ShieldAlert,
    title: "Any organization with something worth attacking",
    description:
      "iRES isn't built for one industry. Any organization running systems worth protecting - and worth someone's time to attack - is a fit.",
    accent: "bg-sky-500/10 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300",
  },
  {
    icon: Layers,
    title: "Starting with financial institutions",
    description:
      "Our first deployments are with financial-sector clients in Nigeria - regulated, high-stakes environments where every escalation needs a name and a timestamp attached.",
    accent: "bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
  },
];

export function AdvantageGrid() {
  return (
    <section id="platform" className="relative bg-secondary/40 py-20 sm:py-28">
      <SectionBackdrop />
      <div className="relative mx-auto max-w-6xl px-6 sm:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold tracking-wide text-brand-red uppercase">
            Who it&apos;s for
          </span>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Who iRES is built for
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {ADVANTAGES.map(({ icon: Icon, title, description, accent }, i) => (
            <Reveal key={title} delay={i * 0.05}>
              <Card className="h-full ring-border/60">
                <CardHeader>
                  <div className={`mb-2 flex size-11 items-center justify-center rounded-xl ${accent}`}>
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

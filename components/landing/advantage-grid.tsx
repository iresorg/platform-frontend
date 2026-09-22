import { Layers, Lock, Plug, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Reveal } from "@/components/landing/reveal";
import { SectionBackdrop } from "@/components/landing/section-backdrop";

const ADVANTAGES = [
  {
    icon: ShieldAlert,
    title: "Prevention-first triage",
    description:
      "Every alert is risk-scored and correlated with threat intel before an analyst ever touches it, so the highest-risk cases surface first — not whatever landed last.",
    accent: "bg-sky-500/10 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300",
  },
  {
    icon: Layers,
    title: "Built for multi-tenant SOCs",
    description:
      "One workspace, every customer isolated. Analysts see everything they're responsible for; each client only ever sees their own cases.",
    accent: "bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
  },
  {
    icon: Lock,
    title: "Role-based access control",
    description:
      "Team roles and permissions are scoped per tenant — assign exactly who can view, triage, escalate, or manage a workspace, and revoke access instantly.",
    accent: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
  },
  {
    icon: Plug,
    title: "Real integrations, not a demo",
    description:
      "Live-wired to Wazuh for detections and OpenCTI for intelligence — the alerts and incidents you see are the ones actually happening, not sample data.",
    accent: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
];

export function AdvantageGrid() {
  return (
    <section id="platform" className="relative bg-secondary/40 py-20 sm:py-28">
      <SectionBackdrop />
      <div className="relative mx-auto max-w-6xl px-6 sm:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold tracking-wide text-brand-red uppercase">
            The iRES advantage
          </span>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Everything a SOC needs, nothing a client shouldn&apos;t see.
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

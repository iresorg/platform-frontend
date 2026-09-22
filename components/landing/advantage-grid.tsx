import { Layers, Lock, Plug, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Reveal } from "@/components/landing/reveal";

const ADVANTAGES = [
  {
    icon: ShieldAlert,
    title: "Prevention-first triage",
    description:
      "Every alert is risk-scored and correlated with threat intel before an analyst ever touches it, so the highest-risk cases surface first — not whatever landed last.",
  },
  {
    icon: Layers,
    title: "Built for multi-tenant SOCs",
    description:
      "One workspace, every customer isolated. Analysts see everything they're responsible for; each client only ever sees their own cases.",
  },
  {
    icon: Lock,
    title: "Role-based access control",
    description:
      "Team roles and permissions are scoped per tenant — assign exactly who can view, triage, escalate, or manage a workspace, and revoke access instantly.",
  },
  {
    icon: Plug,
    title: "Real integrations, not a demo",
    description:
      "Live-wired to Wazuh for detections and OpenCTI for intelligence — the alerts and incidents you see are the ones actually happening, not sample data.",
  },
];

export function AdvantageGrid() {
  return (
    <section id="platform" className="bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold tracking-wide text-brand-red uppercase">
            The iRES advantage
          </span>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Everything a SOC needs, nothing a client shouldn&apos;t see.
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {ADVANTAGES.map(({ icon: Icon, title, description }, i) => (
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

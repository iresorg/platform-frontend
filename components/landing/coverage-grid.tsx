import {
  AlertTriangle,
  FolderKanban,
  MonitorSmartphone,
  Radar,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Reveal } from "@/components/landing/reveal";

const COVERAGE = [
  {
    icon: Radar,
    title: "Live Alerts",
    description: "Every live detection, triaged and escalated in real time.",
  },
  {
    icon: AlertTriangle,
    title: "Incidents",
    description: "Escalated alerts become tracked incidents with a full timeline.",
  },
  {
    icon: FolderKanban,
    title: "Case Pipeline",
    description: "SLA, risk score, assigned analyst, and verdict — one view per case.",
  },
  {
    icon: MonitorSmartphone,
    title: "Customer Portal",
    description: "Plain-language status your clients can actually act on.",
  },
  {
    icon: Users,
    title: "Team & RBAC",
    description: "Tenant-scoped roles and permissions, managed per workspace.",
  },
  {
    icon: ShieldCheck,
    title: "Threat Intelligence",
    description: "OpenCTI context attached automatically, confidence-scored.",
  },
];

export function CoverageGrid() {
  return (
    <section className="bg-background py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold tracking-wide text-brand-red uppercase">
            Coverage
          </span>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            iRES has you covered.
          </h2>
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

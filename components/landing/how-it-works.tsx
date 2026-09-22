"use client";

import { Gauge, MessageSquareText, Radar, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/landing/reveal";
import { SectionBackdrop } from "@/components/landing/section-backdrop";
import { ScrollStack, type ScrollStage } from "@/components/landing/scroll-stack";

const STAGES: ScrollStage[] = [
  {
    label: "Detect",
    title: "Every Wazuh detection, the moment it fires.",
    description:
      "Alerts stream in live — refreshed every 20 seconds, not batched overnight — so nothing sits in a queue nobody's watching.",
    icon: Radar,
    accent: "sky",
  },
  {
    label: "Correlate",
    title: "OpenCTI context attaches itself automatically.",
    description:
      "Every alert lands with confidence-scored threat intelligence already attached, so analysts start investigating instead of searching.",
    icon: ShieldCheck,
    accent: "violet",
  },
  {
    label: "Triage",
    title: "Risk-scored, SLA-tracked, assigned instantly.",
    description:
      "Each case carries a risk score and a running SLA countdown from the second it's opened, and routes to the right analyst without manual handoffs.",
    icon: Gauge,
    accent: "amber",
  },
  {
    label: "Communicate",
    title: "Clients get the plain-language version.",
    description:
      "The customer portal shows what happened and what to do next — never raw logs, rule IDs, or anything that needs a security background to parse.",
    icon: MessageSquareText,
    accent: "emerald",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-background py-20 sm:py-28">
      <div className="relative pb-16">
        <SectionBackdrop />
        <Reveal className="mx-auto max-w-2xl px-6 text-center sm:px-10">
          <span className="text-xs font-bold tracking-wide text-brand-red uppercase">
            One pipeline
          </span>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            From detection to a client who understands what happened.
          </h2>
        </Reveal>
      </div>

      <div className="lg:mt-4">
        <ScrollStack stages={STAGES} />
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { Gauge, MessageSquareText, Radar, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/landing/reveal";
import { SectionBackdrop } from "@/components/landing/section-backdrop";
import { ScrollStack, type ScrollStage } from "@/components/landing/scroll-stack";

const STAGES: ScrollStage[] = [
  {
    label: "Detection",
    title: "A real signal fires in your environment.",
    description:
      "The moment it lands, iRES turns it into a case, not a line in a log someone might get to.",
    icon: Radar,
    accent: "sky",
  },
  {
    label: "L1 Triage",
    title: "An analyst picks it up from the queue and investigates.",
    description: "Fast, high-volume first response on every case that comes in.",
    icon: ShieldCheck,
    accent: "violet",
  },
  {
    label: "L2 Investigation",
    title: "If it needs more than a first look,",
    description: "An L2 analyst takes it on for deeper investigation and containment.",
    icon: Gauge,
    accent: "amber",
  },
  {
    label: "L3 Incident Command",
    title: "The most serious cases go to incident command for coordinated response.",
    description: "Every action logged as it happens.",
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
            Case flow
          </span>
          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            From first signal to closed case
          </h2>
        </Reveal>
      </div>

      <div className="lg:mt-4">
        <ScrollStack stages={STAGES} />
      </div>

      <Reveal className="mx-auto mt-16 flex max-w-xl flex-col items-center gap-5 px-6 text-center sm:px-10">
        <p className="text-base text-muted-foreground">
          One case, one record, from alert to resolution.
        </p>
        <Button asChild size="lg">
          <Link href="/login">Sign in</Link>
        </Button>
      </Reveal>
    </section>
  );
}

"use client";

import { motion } from "motion/react";
import { Reveal } from "@/components/landing/reveal";

const TRUST_ITEMS = [
  "L1 → L2 → L3 escalation",
  "Every action timestamped",
  "24/7 coverage",
];

export function IntegrationsStrip() {
  const items = [...TRUST_ITEMS, ...TRUST_ITEMS];

  return (
    <section className="border-y border-border bg-background py-14">
      <Reveal className="mx-auto max-w-2xl px-6 text-center sm:px-10">
        <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
          What every case gets
        </p>
      </Reveal>

      <div className="relative mt-8 overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
        <motion.div
          className="flex w-max items-center gap-16"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 22, ease: "linear", repeat: Infinity }}
        >
          {items.map((name, i) => (
            <span
              key={`${name}-${i}`}
              className="font-heading text-xl font-bold whitespace-nowrap text-muted-foreground/70"
            >
              {name}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

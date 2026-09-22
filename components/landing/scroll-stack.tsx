"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { cn } from "cn";
import type { LucideIcon } from "lucide-react";

export type ScrollStageAccent = "sky" | "violet" | "amber" | "emerald";

export type ScrollStage = {
  label: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: ScrollStageAccent;
};

const ACCENTS: Record<
  ScrollStageAccent,
  { chip: string; pill: string; glow: string }
> = {
  sky: {
    chip: "bg-sky-500/10 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300",
    pill: "bg-sky-600 dark:bg-sky-500",
    glow: "#0ea5e9",
  },
  violet: {
    chip: "bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
    pill: "bg-violet-600 dark:bg-violet-500",
    glow: "#8b5cf6",
  },
  amber: {
    chip: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300",
    pill: "bg-amber-600 dark:bg-amber-500",
    glow: "#f59e0b",
  },
  emerald: {
    chip: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300",
    pill: "bg-emerald-600 dark:bg-emerald-500",
    glow: "#10b981",
  },
};

function jumpToStage(
  container: HTMLDivElement,
  index: number,
  total: number
) {
  const rect = container.getBoundingClientRect();
  const containerTop = rect.top + window.scrollY;
  const stageHeight = rect.height / total;
  window.scrollTo({
    top: containerTop + stageHeight * index + 1,
    behavior: "smooth",
  });
}

export function ScrollStack({ stages }: { stages: ScrollStage[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const index = Math.min(
      stages.length - 1,
      Math.max(0, Math.floor(latest * stages.length))
    );
    setActive((prev) => (prev === index ? prev : index));
  });

  return (
    <div>
      {/* Desktop: pinned visual, scroll-synced stage list */}
      <div
        ref={containerRef}
        className="relative hidden lg:block"
        style={{ height: `${stages.length * 100}vh` }}
      >
        <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.05] dark:opacity-[0.08]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/4 size-[30rem] rounded-full bg-brand-navy/5 blur-3xl dark:bg-brand-navy/15"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-32 right-1/4 size-[26rem] rounded-full bg-brand-red/5 blur-3xl dark:bg-brand-red/10"
          />

          <div className="relative mx-auto grid w-full max-w-6xl gap-16 px-10 lg:grid-cols-[22rem_1fr] lg:items-center">
            <ol className="flex flex-col gap-1.5">
              {stages.map((stage, i) => {
                const accent = ACCENTS[stage.accent];
                return (
                  <li key={stage.label}>
                    <button
                      type="button"
                      onClick={() =>
                        containerRef.current &&
                        jumpToStage(containerRef.current, i, stages.length)
                      }
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors",
                        i === active
                          ? cn(accent.pill, "text-white")
                          : "text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                          i === active ? "border-white/30" : "border-border"
                        )}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-heading text-sm font-bold">
                        {stage.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="relative min-h-[22rem]">
              {stages.map((stage, i) => {
                const Icon = stage.icon;
                const accent = ACCENTS[stage.accent];
                return (
                  <motion.div
                    key={stage.label}
                    initial={false}
                    animate={{
                      opacity: active === i ? 1 : 0,
                      y: active === i ? 0 : 20,
                    }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    aria-hidden={active !== i}
                    className={cn(
                      "absolute inset-0 flex flex-col gap-6 overflow-hidden rounded-3xl border border-border bg-card p-10 shadow-sm",
                      active === i ? "pointer-events-auto" : "pointer-events-none"
                    )}
                  >
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full opacity-25 blur-3xl"
                      style={{ backgroundColor: accent.glow }}
                    />
                    <div
                      className={cn(
                        "relative flex size-14 items-center justify-center rounded-2xl",
                        accent.chip
                      )}
                    >
                      <Icon className="size-7" aria-hidden="true" />
                    </div>
                    <h3 className="relative text-2xl font-bold sm:text-3xl">
                      {stage.title}
                    </h3>
                    <p className="relative max-w-lg text-base leading-relaxed text-muted-foreground">
                      {stage.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile / tablet: plain stacked cards, no scroll-jacking */}
      <div className="flex flex-col gap-4 px-6 sm:px-10 lg:hidden">
        {stages.map((stage, i) => {
          const Icon = stage.icon;
          const accent = ACCENTS[stage.accent];
          return (
            <div
              key={stage.label}
              className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-card p-6"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full opacity-20 blur-3xl"
                style={{ backgroundColor: accent.glow }}
              />
              <div className="relative flex items-center gap-3">
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    accent.chip
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className={cn("flex size-10 items-center justify-center rounded-xl", accent.chip)}>
                  <Icon className="size-5" aria-hidden="true" />
                </div>
              </div>
              <h3 className="relative text-xl font-bold">{stage.title}</h3>
              <p className="relative text-sm leading-relaxed text-muted-foreground">
                {stage.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

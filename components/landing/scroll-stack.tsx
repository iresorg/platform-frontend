"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { cn } from "cn";
import type { LucideIcon } from "lucide-react";

export type ScrollStage = {
  label: string;
  title: string;
  description: string;
  icon: LucideIcon;
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
          <div className="mx-auto grid w-full max-w-6xl gap-16 px-10 lg:grid-cols-[22rem_1fr] lg:items-center">
            <ol className="flex flex-col gap-1.5">
              {stages.map((stage, i) => (
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
                        ? "bg-brand-navy text-white dark:bg-white dark:text-brand-navy"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                        i === active
                          ? "border-white/30 dark:border-brand-navy/30"
                          : "border-border"
                      )}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-heading text-sm font-bold">
                      {stage.label}
                    </span>
                  </button>
                </li>
              ))}
            </ol>

            <div className="relative min-h-[22rem]">
              {stages.map((stage, i) => {
                const Icon = stage.icon;
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
                      "absolute inset-0 flex flex-col gap-6 rounded-3xl border border-border bg-card p-10 shadow-sm",
                      active === i ? "pointer-events-auto" : "pointer-events-none"
                    )}
                  >
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-brand-navy/10 text-brand-navy dark:bg-brand-navy/20 dark:text-[#8b8fe8]">
                      <Icon className="size-7" aria-hidden="true" />
                    </div>
                    <h3 className="text-2xl font-bold sm:text-3xl">
                      {stage.title}
                    </h3>
                    <p className="max-w-lg text-base leading-relaxed text-muted-foreground">
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
          return (
            <div
              key={stage.label}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-navy/10 text-xs font-bold text-brand-navy dark:bg-brand-navy/20 dark:text-[#8b8fe8]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex size-10 items-center justify-center rounded-xl bg-brand-navy/10 text-brand-navy dark:bg-brand-navy/20 dark:text-[#8b8fe8]">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
              </div>
              <h3 className="text-xl font-bold">{stage.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {stage.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

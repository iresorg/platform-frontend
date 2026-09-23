"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 h-[28rem] w-[44rem] -translate-x-1/2 rounded-full bg-brand/20 blur-3xl dark:bg-brand/25"
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 pt-20 pb-20 text-center sm:px-10 sm:pt-28 sm:pb-28">
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="max-w-3xl text-4xl leading-[1.1] font-bold sm:text-6xl"
        >
          Every alert has a <span className="text-brand">person accountable</span> for it,
          end to end.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-xl text-lg text-muted-foreground"
        >
          Detection tools tell you something happened. iRES tracks who is
          handling it, who it was escalated to, and what was actually done.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <Button asChild size="lg" className="h-12 px-6 text-base">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 px-6 text-base"
          >
            <Link href="mailto:support@iresorg.com">Request access</Link>
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-lg text-sm text-muted-foreground"
        >
          Access is invite-only. Existing analysts and protected
          organizations sign in above - new organizations, get in touch to
          be set up.
        </motion.p>

        <motion.a
          href="#how-it-works"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-4 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
        >
          See how it works ↓
        </motion.a>
      </div>
    </section>
  );
}

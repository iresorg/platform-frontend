"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-brand-navy text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-40 size-[36rem] rounded-full bg-brand-red/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-48 -left-32 size-[28rem] rounded-full bg-white/10 blur-3xl"
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 pt-20 pb-20 text-center sm:px-10 sm:pt-28 sm:pb-28">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold tracking-wide text-white/80 uppercase"
        >
          24/7 Cyber Emergency Response
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="max-w-3xl text-4xl leading-[1.1] font-bold sm:text-6xl"
        >
          Every alert has a person accountable for it, end to end.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-xl text-lg text-white/70"
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
          <Button
            asChild
            size="lg"
            className="h-12 bg-brand-red px-6 text-base hover:bg-brand-red/90"
          >
            <Link href="/login">Sign in</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-12 border-white/30 bg-white/5 px-6 text-base text-white hover:bg-white/10 hover:text-white"
          >
            <Link href="mailto:support@iresorg.com">Request access</Link>
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-lg text-sm text-white/50"
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
          className="mt-4 text-sm font-medium text-white/70 transition-colors hover:text-white"
        >
          See how it works ↓
        </motion.a>
      </div>
    </section>
  );
}

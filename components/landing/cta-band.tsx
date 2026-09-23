import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/landing/reveal";

export function CtaBand() {
  return (
    <section className="relative overflow-hidden bg-brand-navy py-20 text-white sm:py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-brand-red/20 blur-3xl"
      />
      <Reveal className="relative mx-auto flex max-w-2xl flex-col items-center gap-6 px-6 text-center sm:px-10">
        <h2 className="text-3xl font-bold sm:text-4xl">
          Every case needs someone accountable for it.
        </h2>
        <p className="max-w-lg text-white/70">
          Sign in to see your queue, or get in touch if your organization
          needs to be set up.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
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
        </div>
      </Reveal>
    </section>
  );
}

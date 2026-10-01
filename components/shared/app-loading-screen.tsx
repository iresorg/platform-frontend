import { Wordmark } from "@/components/brand/wordmark";

// Full-screen branded splash for the few moments the app has nothing
// useful to show yet (checking a stored session, resolving a route's
// search params on first paint). Same navy-glow treatment as the auth
// panel, so it reads as part of the same product rather than a generic
// spinner.
export function AppLoadingScreen({ label = "Loading iRES..." }: { label?: string }) {
  return (
    <div
      role="status"
      aria-label={label}
      className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-navy py-16 text-white"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 left-1/2 size-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-red/20 blur-3xl"
      />

      <div className="relative flex flex-col items-center gap-5">
        <Wordmark inverted className="h-12 w-auto opacity-90" />
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-white/60">{label}</p>
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="size-1.5 rounded-full bg-white/70 motion-safe:animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

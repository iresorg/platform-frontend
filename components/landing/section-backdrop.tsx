import { cn } from "cn";

/**
 * Decorative color-wash layer for content sections — soft gradient blobs
 * over a faint dot grid, the same device the hero/CTA bands use, scaled
 * down for light surfaces. Purely visual: absolutely positioned, inert.
 */
export function SectionBackdrop({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}
    >
      <div
        className="absolute inset-0 opacity-[0.05] dark:opacity-[0.08]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="absolute -top-32 -left-24 size-[26rem] rounded-full bg-brand-navy/10 blur-3xl dark:bg-brand-navy/25" />
      <div className="absolute top-1/3 -right-32 size-[24rem] rounded-full bg-brand-red/10 blur-3xl dark:bg-brand-red/15" />
      <div className="absolute -bottom-40 left-1/3 size-[22rem] rounded-full bg-[#8b8fe8]/10 blur-3xl dark:bg-[#8b8fe8]/15" />
    </div>
  );
}

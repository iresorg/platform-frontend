// Device-and-badges composition for the auth panel. The five icons are real
// 3D renders (CC0, https://3dicons.co), not drawn shapes — each is a white
// "clay" render composited over a brand-colored chip with mix-blend-mode:
// multiply, which lets the render's own shading tint to that chip's color
// (white becomes transparent, its greys darken toward the chip hue) instead
// of needing a pre-colored asset or a cut-out alpha channel.
export function SecurityIllustration({ className }: { className?: string }) {
  return (
    <div className={`relative h-64 w-72 shrink-0 ${className ?? ""}`} aria-hidden="true">
      {/* laptop */}
      <div className="absolute bottom-8 left-1/2 h-36 w-56 -translate-x-1/2 rounded-2xl border border-white/10 bg-gradient-to-b from-[#232659] to-[#171a3d] shadow-[0_20px_45px_-15px_rgba(0,0,0,0.6)]" />
      <div className="absolute bottom-4 left-1/2 h-3.5 w-64 -translate-x-1/2 rounded-full bg-gradient-to-b from-[#2a2e5c] to-[#14163a]" />

      {/* shield, centered on the screen */}
      <div className="isolate absolute bottom-16 left-1/2 flex size-20 -translate-x-1/2 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-ires-red to-[#8c0a19] shadow-[0_10px_25px_-8px_rgba(209,15,36,0.55)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/auth-illustration/shield.png" alt="" className="size-16 mix-blend-multiply" />
      </div>

      {/* floating badges */}
      <div className="isolate absolute top-2 left-2 flex size-12 rotate-[-4deg] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-ocean to-[#0f3fa8] shadow-[0_10px_20px_-8px_rgba(25,91,255,0.55)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/auth-illustration/lock.png" alt="" className="size-9 mix-blend-multiply" />
      </div>
      <div className="isolate absolute top-6 right-8 flex size-14 rotate-3 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-sunset to-ires-red shadow-[0_10px_20px_-8px_rgba(255,112,67,0.5)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/auth-illustration/fire.png" alt="" className="size-10 mix-blend-multiply" />
      </div>
      <div className="isolate absolute top-24 right-0 flex size-12 rotate-3 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-sky to-ocean shadow-[0_10px_20px_-8px_rgba(25,91,255,0.5)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/auth-illustration/chat.png" alt="" className="size-9 mix-blend-multiply" />
      </div>
      <div className="isolate absolute bottom-20 right-4 flex size-8 items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_6px_14px_-4px_rgba(0,0,0,0.4)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/auth-illustration/tick.png"
          alt=""
          className="size-5 mix-blend-multiply"
          style={{ filter: "sepia(1) saturate(8) hue-rotate(175deg) brightness(0.65) contrast(1.3)" }}
        />
      </div>
    </div>
  );
}

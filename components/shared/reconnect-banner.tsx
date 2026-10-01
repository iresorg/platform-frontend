import { WifiOff } from "lucide-react";

// Thin, non-blocking, and it goes away on its own when polling recovers.
// Whatever was on screen stays on screen underneath it.
export function ReconnectBanner({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div role="status" className="border-b border-tone-amber-line bg-tone-amber-bg text-sm text-tone-amber-fg">
      <div className="flex w-full items-center gap-2 px-4 py-1.5 sm:px-6">
        <WifiOff className="size-4" aria-hidden="true" />
        Reconnecting to the server — showing the last data we received.
      </div>
    </div>
  );
}

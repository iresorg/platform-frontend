import { ShieldCheck } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export const INTEL_CONFIRMED_THRESHOLD = 80;

// A small marker, not a label: it only says "the threat feeds know this one".
export function IntelBadge({ score }: { score: number | null | undefined }) {
  if (score === null || score === undefined || score < INTEL_CONFIRMED_THRESHOLD) return null;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className="inline-flex size-5 items-center justify-center rounded-full bg-tone-red-bg text-tone-red-fg"
          role="img"
          aria-label="Confirmed threat intelligence match"
        >
          <ShieldCheck className="size-3.5" aria-hidden="true" />
        </span>
      </TooltipTrigger>
      <TooltipContent>Confirmed threat intelligence match</TooltipContent>
    </Tooltip>
  );
}

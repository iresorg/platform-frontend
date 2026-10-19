import { ColorBadge } from "@/components/ui/color-badge";

// Marks a case or customer created during an onboarding simulation.
// Analyst app only — test clients never see their own TEST badge, and
// the backend already excludes test data from KPIs.
export function TestBadge() {
  return (
    <ColorBadge tone="slate" variant="outline" aria-label="Test data">
      TEST
    </ColorBadge>
  );
}

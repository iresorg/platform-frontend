import { ColorBadge } from "@/components/ui/color-badge";
import { CUSTOMER_STATUS_LABEL, CUSTOMER_STATUS_TONE } from "@/lib/portal/customer-view";
import type { CaseStatus } from "@/lib/cases/types";

export function CustomerStatusBadge({ status }: { status: CaseStatus }) {
  return (
    <ColorBadge tone={CUSTOMER_STATUS_TONE[status]} variant="outline">
      {CUSTOMER_STATUS_LABEL[status]}
    </ColorBadge>
  );
}

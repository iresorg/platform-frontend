"use client";

import { useParams } from "next/navigation";
import { CaseWorkspace } from "@/components/cases/case-workspace";

export default function CaseDetailPage() {
  const params = useParams<{ id: string }>();
  return <CaseWorkspace caseId={params.id} />;
}

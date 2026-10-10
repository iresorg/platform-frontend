"use client";

import { useCan } from "@/hooks/use-can";

// Declarative wrapper over useCan() for JSX call sites where a hook call
// would be awkward — e.g. conditionally rendering a whole block of
// markup. `fallback` renders in place when the check fails; omit it to
// render nothing (hide, not disable — see the guide's hide-vs-disable
// rule for the one case that wants a disabled control with a hint
// instead, which this component doesn't cover on purpose).
export function Can({
  code,
  fallback = null,
  children,
}: {
  code: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const can = useCan();
  return <>{can(code) ? children : fallback}</>;
}

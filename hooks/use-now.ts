"use client";

import { useEffect, useState } from "react";

/**
 * Ticks every `intervalMs` so SLA countdowns stay visually live between
 * the 20s data polls, without triggering extra network requests.
 */
export function useNow(intervalMs = 30_000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}

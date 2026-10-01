"use client";

import { useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";

// True while at least one query that already has data is failing to
// refresh — i.e. a poll failed, not a first load. The data stays; the
// banner just says why it's stale.
export function usePollingDisconnected(): boolean {
  const cache = useQueryClient().getQueryCache();
  return useSyncExternalStore(
    (notify) => cache.subscribe(notify),
    () =>
      cache
        .getAll()
        .some(
          (q) =>
            q.getObserversCount() > 0 &&
            q.state.data !== undefined &&
            q.state.status === "error" &&
            q.state.errorUpdatedAt > q.state.dataUpdatedAt
        ),
    () => false
  );
}

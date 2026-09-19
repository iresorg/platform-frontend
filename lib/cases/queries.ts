"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import {
  addCaseNote,
  assignCase,
  escalateCase,
  fetchCase,
  fetchCaseEvents,
  fetchCases,
  fetchCustomerCases,
  submitVerdict,
  updateCaseStatus,
} from "@/lib/cases/api";
import type {
  AssignedAnalyst,
  Case,
  CaseEvent,
  CaseFilters,
  CaseVerdict,
} from "@/lib/cases/types";
import { CASE_POLL_INTERVAL_MS, REALTIME_MODE } from "@/lib/config";

// REALTIME_MODE === "poll": refetch on an interval (spec allows 15-30s).
// REALTIME_MODE === "push": disable interval refetch — a WebSocket/SSE
// subscription (wired up wherever a live endpoint exists) is expected to
// call queryClient.invalidateQueries() instead. See lib/config.ts.
const POLL_REFETCH_INTERVAL =
  REALTIME_MODE === "poll" ? CASE_POLL_INTERVAL_MS : false;

export const caseKeys = {
  all: ["cases"] as const,
  lists: () => [...caseKeys.all, "list"] as const,
  list: (filters?: CaseFilters) => [...caseKeys.lists(), filters ?? {}] as const,
  details: () => [...caseKeys.all, "detail"] as const,
  detail: (id: string) => [...caseKeys.details(), id] as const,
  events: (id: string) => [...caseKeys.detail(id), "events"] as const,
  customer: (customerId: string) => ["customerCases", customerId] as const,
};

export function useCasesQuery(filters?: CaseFilters) {
  return useQuery({
    queryKey: caseKeys.list(filters),
    queryFn: () => fetchCases(filters),
    refetchInterval: POLL_REFETCH_INTERVAL,
  });
}

export function useCaseQuery(id: string) {
  return useQuery({
    queryKey: caseKeys.detail(id),
    queryFn: () => fetchCase(id),
    refetchInterval: POLL_REFETCH_INTERVAL,
  });
}

export function useCaseEventsQuery(id: string) {
  return useQuery({
    queryKey: caseKeys.events(id),
    queryFn: () => fetchCaseEvents(id),
    refetchInterval: POLL_REFETCH_INTERVAL,
  });
}

export function useCustomerCasesQuery(customerId: string) {
  return useQuery({
    queryKey: caseKeys.customer(customerId),
    queryFn: () => fetchCustomerCases(customerId),
    refetchInterval: POLL_REFETCH_INTERVAL,
  });
}

/**
 * Optimistically patches a case everywhere it's cached (list + detail),
 * returning a snapshot so callers can roll back onError.
 */
function optimisticallyPatchCase(
  queryClient: QueryClient,
  id: string,
  patch: Partial<Case>
) {
  const previousDetail = queryClient.getQueryData<Case>(caseKeys.detail(id));
  const previousLists = queryClient.getQueriesData<Case[]>({
    queryKey: caseKeys.lists(),
  });

  queryClient.setQueryData<Case>(caseKeys.detail(id), (old) =>
    old ? { ...old, ...patch } : old
  );
  queryClient.setQueriesData<Case[]>({ queryKey: caseKeys.lists() }, (old) =>
    old?.map((c) => (c.id === id ? { ...c, ...patch } : c))
  );

  return { previousDetail, previousLists };
}

function rollbackCase(
  queryClient: QueryClient,
  id: string,
  snapshot: {
    previousDetail?: Case;
    previousLists: [readonly unknown[], Case[] | undefined][];
  }
) {
  if (snapshot.previousDetail) {
    queryClient.setQueryData(caseKeys.detail(id), snapshot.previousDetail);
  }
  for (const [key, data] of snapshot.previousLists) {
    queryClient.setQueryData(key, data);
  }
}

async function cancelCaseQueries(queryClient: QueryClient, id: string) {
  await Promise.all([
    queryClient.cancelQueries({ queryKey: caseKeys.detail(id) }),
    queryClient.cancelQueries({ queryKey: caseKeys.lists() }),
  ]);
}

export function useAssignCaseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, analyst }: { id: string; analyst: AssignedAnalyst }) =>
      assignCase(id, analyst),
    onMutate: async ({ id, analyst }) => {
      await cancelCaseQueries(queryClient, id);
      const snapshot = optimisticallyPatchCase(queryClient, id, {
        assigned_analyst: analyst,
      });
      return snapshot;
    },
    onError: (_err, { id }, snapshot) => {
      if (snapshot) rollbackCase(queryClient, id, snapshot);
    },
    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: caseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: caseKeys.lists() });
    },
  });
}

export function useUpdateCaseStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Case["status"] }) =>
      updateCaseStatus(id, status),
    onMutate: async ({ id, status }) => {
      await cancelCaseQueries(queryClient, id);
      return optimisticallyPatchCase(queryClient, id, { status });
    },
    onError: (_err, { id }, snapshot) => {
      if (snapshot) rollbackCase(queryClient, id, snapshot);
    },
    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: caseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: caseKeys.lists() });
    },
  });
}

export function useEscalateCaseMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      escalateCase(id, reason),
    onMutate: async ({ id }) => {
      await cancelCaseQueries(queryClient, id);
      return optimisticallyPatchCase(queryClient, id, { status: "escalated" });
    },
    onError: (_err, { id }, snapshot) => {
      if (snapshot) rollbackCase(queryClient, id, snapshot);
    },
    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: caseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: caseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: caseKeys.events(id) });
    },
  });
}

export function useSubmitVerdictMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, verdict }: { id: string; verdict: CaseVerdict }) =>
      submitVerdict(id, verdict),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: caseKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: caseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: caseKeys.events(id) });
    },
  });
}

export function useAddCaseNoteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      addCaseNote(id, note),
    onMutate: async ({ id, note }) => {
      await queryClient.cancelQueries({ queryKey: caseKeys.events(id) });
      const previousEvents = queryClient.getQueryData<CaseEvent[]>(
        caseKeys.events(id)
      );
      const optimisticEvent: CaseEvent = {
        id: `optimistic-${Date.now()}`,
        case_id: id,
        type: "note",
        message: note,
        actor_name: "You",
        created_at: new Date().toISOString(),
      };
      queryClient.setQueryData<CaseEvent[]>(caseKeys.events(id), (old) => [
        ...(old ?? []),
        optimisticEvent,
      ]);
      return { previousEvents };
    },
    onError: (_err, { id }, context) => {
      if (context?.previousEvents) {
        queryClient.setQueryData(caseKeys.events(id), context.previousEvents);
      }
    },
    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: caseKeys.events(id) });
    },
  });
}

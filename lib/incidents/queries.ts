"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addIncidentNote,
  assignIncident,
  changeIncidentStatus,
  createIncident,
  escalateIncident,
  fetchIncident,
  fetchIncidentRaw,
  fetchIncidents,
  fetchIncidentTimeline,
  fetchIncidentStats,
  updateIncident,
  updateIncidentVerdict,
} from "@/lib/incidents/api";
import type {
  AddNotePayload,
  CaseVerdict,
  ChangeStatusPayload,
  CreateIncidentPayload,
  Incident,
  IncidentFilters,
  TimelineParams,
  UpdateIncidentPayload,
} from "@/lib/incidents/types";
import { CASE_POLL_INTERVAL_MS, REALTIME_MODE } from "@/lib/config";

const POLL_REFETCH_INTERVAL =
  REALTIME_MODE === "poll" ? CASE_POLL_INTERVAL_MS : false;

export const incidentKeys = {
  all: ["incidents"] as const,
  lists: () => [...incidentKeys.all, "list"] as const,
  list: (filters?: IncidentFilters) => [...incidentKeys.lists(), filters ?? {}] as const,
  details: () => [...incidentKeys.all, "detail"] as const,
  detail: (id: string) => [...incidentKeys.details(), id] as const,
  stats: () => [...incidentKeys.all, "stats"] as const,
};

export function useIncidentsQuery(filters?: IncidentFilters) {
  return useQuery({
    queryKey: incidentKeys.list(filters),
    queryFn: () => fetchIncidents(filters),
    refetchInterval: POLL_REFETCH_INTERVAL,
    // Changing a filter or page must never blank the table — keep showing
    // the previous rows until the new ones arrive.
    placeholderData: keepPreviousData,
    retry: false,
  });
}

export function useIncidentQuery(id: string) {
  return useQuery({
    queryKey: incidentKeys.detail(id),
    queryFn: () => fetchIncident(id),
    refetchInterval: POLL_REFETCH_INTERVAL,
    retry: false,
  });
}

export function useIncidentStatsQuery() {
  return useQuery({
    queryKey: incidentKeys.stats(),
    queryFn: () => fetchIncidentStats(),
    refetchInterval: POLL_REFETCH_INTERVAL,
    retry: false,
  });
}

function invalidateIncident(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string
) {
  queryClient.invalidateQueries({ queryKey: incidentKeys.detail(id) });
  queryClient.invalidateQueries({ queryKey: incidentKeys.lists() });
  queryClient.invalidateQueries({ queryKey: incidentKeys.stats() });
}

export function useCreateIncidentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateIncidentPayload) => createIncident(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incidentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: incidentKeys.stats() });
    },
  });
}

export function useUpdateIncidentMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateIncidentPayload }) =>
      updateIncident(id, payload),
    onSuccess: (_data, { id }) => invalidateIncident(queryClient, id),
  });
}

export function useAddIncidentNoteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AddNotePayload }) =>
      addIncidentNote(id, payload),
    onSuccess: (note, { id }) => {
      // The response is the created note — show it now rather than
      // waiting on a (slow) refetch of the whole incident.
      queryClient.setQueryData<Incident>(incidentKeys.detail(id), (old) =>
        old ? { ...old, notes: [...old.notes, note] } : old
      );
      invalidateIncident(queryClient, id);
    },
  });
}

export function useChangeIncidentStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ChangeStatusPayload }) =>
      changeIncidentStatus(id, payload),
    // Optimistic: the badge flips at once and rolls back if the call fails.
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: incidentKeys.detail(id) });
      const previous = queryClient.getQueryData<Incident>(incidentKeys.detail(id));
      queryClient.setQueryData<Incident>(incidentKeys.detail(id), (old) =>
        old ? { ...old, status: payload.status } : old
      );
      return { previous };
    },
    onError: (_err, { id }, context) => {
      if (context?.previous) queryClient.setQueryData(incidentKeys.detail(id), context.previous);
    },
    onSuccess: (patch, { id }) => {
      // The response is now only {id, status, resolved_at,
      // resolution_summary} (earlier docs showed a full incident) — merge
      // rather than replace, or every other cached field (title, notes,
      // description...) would vanish until the invalidate below refetches.
      queryClient.setQueryData<Incident>(incidentKeys.detail(id), (old) =>
        old ? { ...old, ...patch } : old
      );
      invalidateIncident(queryClient, id);
    },
  });
}

// Both assign and escalate return the full, updated case — no optimistic
// update needed, the response just replaces the cache directly.
export function useAssignCaseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId?: string }) => assignIncident(id, userId),
    onSuccess: (incident, { id }) => {
      queryClient.setQueryData<Incident>(incidentKeys.detail(id), incident);
      invalidateIncident(queryClient, id);
    },
  });
}

export function useEscalateCaseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => escalateIncident(id, reason),
    onSuccess: (incident, { id }) => {
      queryClient.setQueryData<Incident>(incidentKeys.detail(id), incident);
      invalidateIncident(queryClient, id);
    },
  });
}

// Only called when the inline Incident.raw_document came back empty —
// most cases have it already, so this is a fallback fetch, not the
// default path. enabled also gates it behind the card actually being
// opened, since most cases are never drilled into this deep.
export function useIncidentRawQuery(id: string, enabled: boolean) {
  return useQuery({
    queryKey: [...incidentKeys.detail(id), "raw"] as const,
    queryFn: () => fetchIncidentRaw(id),
    enabled,
    retry: false,
    staleTime: Infinity,
  });
}

export function useIncidentTimelineQuery(id: string, params: TimelineParams, enabled: boolean) {
  return useQuery({
    queryKey: [...incidentKeys.detail(id), "timeline", params] as const,
    queryFn: () => fetchIncidentTimeline(id, params),
    enabled,
    retry: false,
    placeholderData: keepPreviousData,
  });
}

export interface ResolveCaseInput {
  id: string;
  verdict: CaseVerdict;
  internalNotes: string;
  customerGuidance: string;
}

// Three calls, in order: the internal note (never shown to the customer),
// the real verdict + customer_guidance fields (each logs its own timeline
// event on the backend), then the status transition to RESOLVED. Split
// like this rather than one PATCH because /status/ is the only documented
// way to move status, and keeping the note first means it's on the
// timeline even if a later step fails partway through.
export function useResolveCaseMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, verdict, internalNotes, customerGuidance }: ResolveCaseInput) => {
      if (internalNotes.trim()) {
        await addIncidentNote(id, { content: internalNotes.trim() });
      }
      await updateIncidentVerdict(id, { verdict, customer_guidance: customerGuidance });
      return changeIncidentStatus(id, { status: "RESOLVED" });
    },
    onSuccess: (incident, { id }) => {
      queryClient.setQueryData<Incident>(incidentKeys.detail(id), (old) =>
        old ? { ...old, ...incident } : old
      );
      invalidateIncident(queryClient, id);
    },
  });
}

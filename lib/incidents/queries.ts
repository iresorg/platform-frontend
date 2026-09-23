"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addIncidentNote,
  changeIncidentStatus,
  createIncident,
  fetchIncident,
  fetchIncidents,
  fetchIncidentStats,
  updateIncident,
} from "@/lib/incidents/api";
import type {
  AddNotePayload,
  ChangeStatusPayload,
  CreateIncidentPayload,
  Incident,
  IncidentFilters,
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

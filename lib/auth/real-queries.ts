"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  changePassword,
  deleteSession,
  forgotPassword,
  listSessions,
  realLogoutAll,
  resetPassword,
} from "@/lib/auth/real-api";
import type {
  PasswordChangeRequest,
  PasswordForgotRequest,
  PasswordResetRequest,
} from "@/lib/auth/real-types";

export const sessionKeys = { all: ["auth", "sessions"] as const };

export function useSessionsQuery() {
  return useQuery({ queryKey: sessionKeys.all, queryFn: listSessions, retry: false });
}

export function useRevokeSessionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => deleteSession(sessionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sessionKeys.all }),
  });
}

export function useLogoutAllMutation() {
  return useMutation({ mutationFn: realLogoutAll });
}

export function useChangePasswordMutation() {
  return useMutation({ mutationFn: (payload: PasswordChangeRequest) => changePassword(payload) });
}

export function useForgotPasswordMutation() {
  return useMutation({ mutationFn: (payload: PasswordForgotRequest) => forgotPassword(payload) });
}

export function useResetPasswordMutation() {
  return useMutation({ mutationFn: (payload: PasswordResetRequest) => resetPassword(payload) });
}

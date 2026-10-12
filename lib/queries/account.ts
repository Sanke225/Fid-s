'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import type { DeleteAccountInput, TermsStatus } from '@/lib/contracts';

const termsKey = ['me', 'terms'] as const;

/** Version des CGU acceptée par le compte (fenêtre d'acceptation tant qu'elle n'est pas la version en vigueur). */
export function useTermsStatus() {
  return useQuery({
    queryKey: termsKey,
    queryFn: ({ signal }) => apiFetch<TermsStatus>('/me/terms', { signal }),
    staleTime: 5 * 60_000,
  });
}

export function useAcceptTerms() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (version: string) => apiFetch<TermsStatus>('/me/terms', { method: 'POST', body: { version } }),
    onSuccess: status => qc.setQueryData(termsKey, status),
  });
}

/** Ce qui empêche de supprimer le compte, et si le mot de passe sera redemandé. */
export function useDeletionCheck(enabled: boolean) {
  return useQuery({
    queryKey: ['me', 'deletion'],
    queryFn: ({ signal }) => apiFetch<{ blockers: string[]; requiresPassword: boolean }>('/me/deletion', { signal }),
    enabled,
    staleTime: 0,
  });
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: (input: DeleteAccountInput) => apiFetch<void>('/me', { method: 'DELETE', body: input }),
  });
}

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import type { UpdateMeInput, User } from '@/lib/contracts';
import { queryKeys } from './keys';

/** Compte connecté (GET /api/v1/me). */
export function useMe({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: ({ signal }) => apiFetch<{ user: User }>('/me', { signal }).then(r => r.user),
    enabled,
    staleTime: 60_000,
  });
}

/** À appeler après connexion, inscription ou choix du rôle : l'interface voit le compte aussitôt. */
export function useSetMe() {
  const qc = useQueryClient();
  return (user: User) => qc.setQueryData(queryKeys.me, user);
}

/** Initiales pour l'avatar : « Awa Koné » → « AK ». */
export function initials(name: string | null | undefined) {
  return (name ?? '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

export const ROLE_LABEL = { dev: 'Développeur', client: 'Client', admin: 'Administrateur' } as const;

/** Met à jour nom, téléphone et nom commercial (PATCH /api/v1/me). */
export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateMeInput) => apiFetch<{ user: User }>('/me', { method: 'PATCH', body: input }).then(r => r.user),
    onSuccess: user => qc.setQueryData(queryKeys.me, user),
  });
}

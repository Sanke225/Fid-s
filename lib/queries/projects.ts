'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import type { Delivery, DeliveryEvent, Project, ProjectWithDeliveries } from '@/lib/contracts';
import { queryKeys } from './keys';

/** Projets du dev connecté, chacun avec ses livraisons (GET /api/v1/projects). */
export function useProjects({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.projects,
    queryFn: ({ signal }) => apiFetch<{ items: ProjectWithDeliveries[] }>('/projects', { signal }).then(r => r.items),
    enabled,
  });
}

/** Un projet et ses livraisons (GET /api/v1/projects/:id). */
export function useProject(id: string) {
  return useQuery({
    queryKey: queryKeys.project(id),
    queryFn: ({ signal }) => apiFetch<ProjectWithDeliveries>(`/projects/${encodeURIComponent(id)}`, { signal }),
  });
}

/** Historique d'une livraison, rafraîchi toutes les 5 s tant que l'écran est ouvert. */
export function useDeliveryEvents(deliveryId: string | null | undefined) {
  return useQuery({
    queryKey: ['deliveries', deliveryId, 'events'],
    queryFn: ({ signal }) =>
      apiFetch<{ items: DeliveryEvent[] }>(`/deliveries/${encodeURIComponent(deliveryId!)}/events`, { signal }).then(r => r.items),
    enabled: Boolean(deliveryId),
    refetchInterval: 5_000,
  });
}

interface NewDeliveryInput {
  name: string;
  description?: string;
  amountXof: number;
  includeSource: boolean;
  client: { name: string; email?: string; phone?: string };
}

/**
 * Crée le projet puis sa première livraison (POST /projects puis POST /projects/:id/deliveries).
 * Si la livraison échoue, l'erreur porte l'id du projet déjà créé pour pouvoir y renvoyer.
 */
export function useCreateProjectWithDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, description, ...delivery }: NewDeliveryInput) => {
      const project = await apiFetch<Project>('/projects', { method: 'POST', body: { name, description } });
      try {
        await apiFetch<Delivery>(`/projects/${project.id}/deliveries`, { method: 'POST', body: delivery });
      } catch (e) {
        throw Object.assign(e instanceof Error ? e : new Error(String(e)), { projectId: project.id });
      }
      return project;
    },
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.projects }),
  });
}

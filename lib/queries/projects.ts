'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import type { AssignClientInput, AssignClientResult, DeliveryEvent, EnvVarSummary, LinkGithubInput, Project, ProjectWithDeliveries } from '@/lib/contracts';
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

interface NewProjectInput {
  name: string;
  description?: string;
  /** Facultatif : sans client, le projet reste « non assigné ». */
  assign?: AssignClientInput;
  /** Facultatif : dépôt GitHub relié dès la création. */
  github?: LinkGithubInput;
}

/**
 * Crée le projet puis, si demandé, assigne le client (POST /projects puis POST /projects/:id/client).
 * Si l'assignation échoue, l'erreur porte l'id du projet déjà créé pour pouvoir y renvoyer.
 */
export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, description, assign, github }: NewProjectInput) => {
      const project = await apiFetch<Project>('/projects', { method: 'POST', body: { name, description } });
      try {
        if (github) await apiFetch<Project>(`/projects/${project.id}/github`, { method: 'PUT', body: github });
        if (!assign) return { project, credentials: null };
        const result = await apiFetch<AssignClientResult>(`/projects/${project.id}/client`, { method: 'POST', body: assign });
        return { project: result.project, credentials: result.credentials };
      } catch (e) {
        throw Object.assign(e instanceof Error ? e : new Error(String(e)), { projectId: project.id });
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.projects }),
  });
}

/** Assigne un client à un projet existant (POST /projects/:id/client). */
export function useAssignClient(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AssignClientInput) =>
      apiFetch<AssignClientResult>(`/projects/${encodeURIComponent(projectId)}/client`, { method: 'POST', body: input }),
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.projects }),
  });
}

/** « Début du développement » ou « Terminé » (POST /projects/:id/start | finish). */
export function useProjectStep(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (step: 'start' | 'finish') =>
      apiFetch<Project>(`/projects/${encodeURIComponent(projectId)}/${step}`, { method: 'POST' }),
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.projects }),
  });
}

/** Envoi du code (.zip) d'une livraison : met une installation en file (POST /deliveries/:id/source). */
export function useUploadSource(deliveryId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append('archive', file);
      return apiFetch<{ buildId: string; status: string }>(`/deliveries/${encodeURIComponent(deliveryId)}/source`, { method: 'POST', body: form });
    },
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.projects }),
  });
}

/** Variables d'environnement d'une livraison : noms seulement (GET /deliveries/:id/env). */
export function useEnvVars(deliveryId: string) {
  return useQuery({
    queryKey: ['deliveries', deliveryId, 'env'],
    queryFn: ({ signal }) =>
      apiFetch<{ items: EnvVarSummary[] }>(`/deliveries/${encodeURIComponent(deliveryId)}/env`, { signal }).then(r => r.items),
  });
}

export function useSetEnvVar(deliveryId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; value: string }) =>
      apiFetch<EnvVarSummary>(`/deliveries/${encodeURIComponent(deliveryId)}/env`, { method: 'PUT', body: input }),
    onSettled: () => qc.invalidateQueries({ queryKey: ['deliveries', deliveryId, 'env'] }),
  });
}

export function useDeleteEnvVar(deliveryId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      apiFetch<void>(`/deliveries/${encodeURIComponent(deliveryId)}/env/${encodeURIComponent(name)}`, { method: 'DELETE' }),
    onSettled: () => qc.invalidateQueries({ queryKey: ['deliveries', deliveryId, 'env'] }),
  });
}


export type GithubRepoItem = { installationId: string; account: string; fullName: string; private: boolean; defaultBranch: string; pushedAt: string | null };

/** Dépôts GitHub autorisés par le dev (GET /github/repos). configured=false : l'App n'est pas configurée sur ce serveur. */
export function useGithubRepos() {
  return useQuery({
    queryKey: ['github', 'repos'],
    queryFn: ({ signal }) => apiFetch<{ configured: boolean; accounts: string[]; items: GithubRepoItem[] }>('/github/repos', { signal }),
    staleTime: 60_000,
  });
}

export function useGithubBranches(installationId: string | null, repo: string | null) {
  return useQuery({
    queryKey: ['github', 'branches', installationId, repo],
    queryFn: ({ signal }) =>
      apiFetch<{ items: string[] }>(`/github/branches?installation=${encodeURIComponent(installationId!)}&repo=${encodeURIComponent(repo!)}`, { signal }).then(r => r.items),
    enabled: Boolean(installationId && repo),
    staleTime: 60_000,
  });
}

export function useLinkGithub(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: LinkGithubInput | null): Promise<void> => {
      const path = `/projects/${encodeURIComponent(projectId)}/github`;
      await (input ? apiFetch<Project>(path, { method: 'PUT', body: input }) : apiFetch<void>(path, { method: 'DELETE' }));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.projects }),
  });
}

/** « Importer le dernier commit » de la branche reliée (POST /deliveries/:id/github/import). */
export function useGithubImport(deliveryId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch<{ buildId: string; commit: { sha: string; message: string } }>(`/deliveries/${encodeURIComponent(deliveryId)}/github/import`, { method: 'POST' }),
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.projects }),
  });
}

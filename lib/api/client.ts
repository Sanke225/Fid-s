// Côté navigateur : appels à /api/v1 avec le format d'erreur commun { error: { code, message } }.
import type { ApiError } from '@/lib/contracts';

const FALLBACK = 'Service momentanément indisponible. Réessayez dans un instant.';

export class ApiClientError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: Record<string, unknown>,
  ) {
    super(message);
  }
}

interface ApiInit {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
}

/** Appelle /api/v1{path}. Lève ApiClientError avec le message (déjà en français) renvoyé par l'API. */
export async function apiFetch<T>(path: string, { method = 'GET', body, signal }: ApiInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api/v1${path}`, {
      method,
      signal,
      credentials: 'same-origin',
      // FormData (dépôt d'archive) : le navigateur pose lui-même l'en-tête multipart.
      headers: body === undefined || body instanceof FormData ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') throw e;
    throw new ApiClientError(0, 'NETWORK', FALLBACK);
  }

  if (res.status === 204) return undefined as T;
  const data = (await res.json().catch(() => null)) as (T & Partial<ApiError>) | null;
  if (!res.ok) {
    const err = data?.error;
    throw new ApiClientError(res.status, err?.code ?? 'INTERNAL_ERROR', err?.message ?? FALLBACK, err?.details);
  }
  return data as T;
}

/** Message à afficher pour n'importe quelle erreur levée par apiFetch. */
export function errorMessage(e: unknown): string {
  return e instanceof ApiClientError ? e.message : FALLBACK;
}

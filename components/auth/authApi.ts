'use client';

import { ApiClientError, apiFetch, errorMessage } from '@/lib/api/client';
import type { User as ApiUser } from '@/lib/contracts';

export type AccountRole = 'dev' | 'client';

export { homeFor } from './paths';

/** Messages en français pour les codes renvoyés par Better Auth ou par /api/v1. */
const MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: 'E-mail ou mot de passe incorrect.',
  USER_ALREADY_EXISTS: 'Un compte existe déjà avec cette adresse e-mail.',
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: 'Un compte existe déjà avec cette adresse e-mail.',
  INVALID_EMAIL: 'Adresse e-mail invalide.',
  PASSWORD_TOO_SHORT: 'Le mot de passe doit contenir au moins 8 caractères.',
  PASSWORD_TOO_LONG: 'Le mot de passe est trop long.',
  ROLE_ALREADY_CHOSEN: 'Le type de compte a déjà été choisi.',
  VALIDATION_ERROR: 'Certaines informations sont invalides.',
};

const FALLBACK = 'Service momentanément indisponible. Réessayez dans un instant.';

export function authErrorMessage(error: { code?: string; message?: string; status?: number } | null | undefined): string {
  if (!error) return FALLBACK;
  if (error.code && MESSAGES[error.code]) return MESSAGES[error.code];
  if (error.status === 429) return 'Trop de tentatives. Patientez une minute avant de réessayer.';
  return FALLBACK;
}

export const fetchMe = () => apiFetch<{ user: ApiUser }>('/me').then(r => r.user);

export const chooseRole = (role: AccountRole) =>
  apiFetch<{ user: ApiUser }>('/me/role', { method: 'POST', body: { role } }).then(r => r.user);

export const updateMe = (input: { phone?: string; businessName?: string }) =>
  apiFetch<{ user: ApiUser }>('/me', { method: 'PATCH', body: input }).then(r => r.user);

/** Message d'une erreur d'API : celui du serveur, ou une traduction du code connu. */
export function failureMessage(e: unknown): string {
  if (e instanceof ApiClientError) return MESSAGES[e.code] ?? e.message;
  return errorMessage(e);
}

export { normalizePhone } from '@/lib/phone';

/** 0 à 4 : longueur, casse mixte, chiffre, symbole ou grande longueur. */
export function passwordScore(pw: string): number {
  if (pw.length < 8) return pw.length ? 1 : 0;
  let s = 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 14) s++;
  return Math.min(s, 4);
}

/** Rôle choisi avant un aller-retour Google : retrouvé au retour pour présélectionner la carte. */
export const PENDING_ROLE_KEY = 'fids_pending_role';

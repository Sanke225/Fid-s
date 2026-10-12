/** Page d'arrivée selon le rôle (utilisable côté serveur comme côté navigateur). */
export function homeFor(role: string | null | undefined): string {
  if (role === 'client') return '/client/dashboard';
  if (role === 'admin') return '/admin/overview';
  return '/dev/dashboard';
}

/** Zones réservées, avec le rôle exigé. Partagé par proxy.ts et les gardes de layout. */
export const PROTECTED = [
  { prefix: '/dev/', role: 'dev' },
  { prefix: '/client/', role: 'client' },
  { prefix: '/admin', role: 'admin' },
] as const;

/**
 * Adresse de retour après connexion : seulement un chemin interne d'une zone réservée
 * (pas de redirection ouverte du type //site.com ou https://…).
 */
export function safeReturn(path: string | null | undefined): string | null {
  if (!path || !path.startsWith('/') || path.startsWith('//') || path.includes('\\')) return null;
  // /apercu/ : ouvert au dev comme au client (droits vérifiés par l'API).
  return PROTECTED.some(z => path.startsWith(z.prefix)) || path.startsWith('/apercu/') ? path : null;
}

/** Le chemin de retour convient-il au rôle de l'utilisateur ? */
export function returnFor(role: string | null | undefined, path: string | null | undefined): string {
  const safe = safeReturn(path);
  const zone = safe ? PROTECTED.find(z => safe.startsWith(z.prefix)) : null;
  if (safe?.startsWith('/apercu/')) return safe;
  return safe && zone?.role === role ? safe : homeFor(role);
}

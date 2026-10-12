// Côté serveur uniquement (lit les en-têtes de la requête).
import { headers } from 'next/headers';
import { auth, enabledSocialProviders } from '@/lib/auth';

export type SocialProvider = (typeof enabledSocialProviders)[number];

/** Boutons à afficher : seulement les fournisseurs configurés (voir lib/auth.ts). */
export const socialProviders = (): SocialProvider[] => [...enabledSocialProviders];

/** Session courante, ou null (y compris si la base est injoignable : la page reste utilisable). */
export async function currentUser() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    return session?.user ?? null;
  } catch {
    return null;
  }
}

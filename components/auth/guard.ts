// Côté serveur uniquement : à appeler en tête des layouts des zones réservées.
import { redirect } from 'next/navigation';
import { homeFor } from './paths';
import { currentUser } from './session';

/**
 * Vérifie la session en base et le rôle. Sans session : connexion. Sans rôle : choix du rôle.
 * Mauvais rôle : renvoyé vers son propre espace (on ne révèle rien de la zone demandée).
 */
export async function requirePageRole(role: 'dev' | 'client' | 'admin', returnPath: string) {
  const user = await currentUser();
  if (!user) redirect(`/connexion?retour=${encodeURIComponent(returnPath)}`);
  // Compte créé par un dev : mot de passe provisoire à remplacer avant d'entrer.
  if (user.mustChangePassword) redirect('/compte/mot-de-passe');
  if (!user.role) redirect('/inscription?etape=role');
  if (user.role !== role) redirect(homeFor(user.role));
  return user;
}

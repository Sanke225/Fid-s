import { redirect } from 'next/navigation';
import { ApplyRole } from '@/components/auth/ApplyRole';
import { returnFor } from '@/components/auth/paths';
import { currentUser } from '@/components/auth/session';

/**
 * Retour de Google, Apple ou GitHub. Rôle déjà connu : tableau de bord. Rôle choisi avant l'aller-retour
 * (?role=dev|client) : enregistré par POST /api/v1/me/role. Sinon : choix du rôle.
 */
export default async function AuthSuitePage({ searchParams }: { searchParams: Promise<{ role?: string; retour?: string }> }) {
  const { role, retour } = await searchParams;
  const user = await currentUser();
  if (!user) redirect('/connexion?erreur=oauth');
  if (user.role) redirect(returnFor(user.role, retour));

  if (role === 'dev' || role === 'client') return <ApplyRole role={role} />;
  redirect('/inscription?etape=role');
}

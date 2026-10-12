import { redirect } from 'next/navigation';
import { currentUser } from '@/components/auth/session';
import { issueHandoff } from '@/lib/preview-token';
import { previewOrigin } from '@/lib/spaces';

// Porte d'entrée de l'aperçu, sur Fid’s : vérifie la session puis passe la main à l'hôte d'aperçu
// (domaine des démos) avec un jeton de 60 s. Les droits sur la livraison sont vérifiés là-bas, par l'API.
export default async function PreviewEntry({ params }: { params: Promise<{ deliveryId: string }> }) {
  const { deliveryId } = await params;
  const user = await currentUser();
  if (!user) redirect(`/connexion?retour=${encodeURIComponent(`/apercu/${deliveryId}`)}`);
  if (user.mustChangePassword) redirect('/compte/mot-de-passe');
  redirect(`${previewOrigin()}/t/${issueHandoff(user.id, deliveryId)}`);
}

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { BRAND } from '@/components/landing/data';
import { PreviewView } from '@/components/preview/PreviewView';
import { previewUser } from '@/lib/core/preview-host';
import { fidsOrigin } from '@/lib/spaces';

export const metadata: Metadata = { title: `Aperçu · ${BRAND}`, robots: { index: false }, referrer: 'no-referrer' };

// Page servie sur apercu.<domaine des démos> (voir proxy.ts). Sans cookie d'aperçu valide : retour par Fid’s,
// qui revérifie la session et redonne un jeton.
export default async function PreviewHostPage({ params }: { params: Promise<{ deliveryId: string }> }) {
  const { deliveryId } = await params;
  if (!(await previewUser())) redirect(`${fidsOrigin()}/apercu/${deliveryId}`);
  return <PreviewView deliveryId={deliveryId} apiBase="/api" fidsOrigin={fidsOrigin()} />;
}

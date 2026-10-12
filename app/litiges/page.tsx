import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { Reserved } from '@/components/legal/Reserved';

export const metadata: Metadata = {
  title: 'Règlement des litiges · Fid’s',
  description: 'Traitement d’un paiement contesté sur Fid’s.',
};

// Contenu réservé à Roxane (rédaction en cours).
export default function LitigesPage() {
  return (
    <LegalPage eyebrow="Paiements et livraison" title="Règlement des litiges" numbered={false} sections={[]}>
      <Reserved />
    </LegalPage>
  );
}

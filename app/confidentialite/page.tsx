import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { Reserved } from '@/components/legal/Reserved';

export const metadata: Metadata = {
  title: 'Politique de confidentialité · Fid’s',
  description: 'Données personnelles collectées par Fid’s et droits des utilisateurs.',
};

// Contenu réservé à Roxane (rédaction en cours).
export default function ConfidentialitePage() {
  return (
    <LegalPage eyebrow="Données personnelles" title="Politique de confidentialité" numbered={false} sections={[]}>
      <Reserved />
    </LegalPage>
  );
}

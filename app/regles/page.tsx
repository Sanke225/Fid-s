import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { Reserved } from '@/components/legal/Reserved';

export const metadata: Metadata = {
  title: 'Règles d’utilisation · Fid’s',
  description: 'Contenus et comportements interdits sur Fid’s.',
};

// Contenu réservé à Roxane (rédaction en cours).
export default function ReglesPage() {
  return (
    <LegalPage eyebrow="Cadre contractuel" title="Règles d’utilisation" numbered={false} sections={[]}>
      <Reserved />
    </LegalPage>
  );
}

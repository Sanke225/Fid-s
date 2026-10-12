import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { Reserved } from '@/components/legal/Reserved';

export const metadata: Metadata = {
  title: 'Questions fréquentes · Fid’s',
  description: 'Questions fréquentes sur Fid’s.',
};

// Contenu réservé à Roxane (rédaction en cours).
export default function FaqPage() {
  return (
    <LegalPage eyebrow="Aide" title="Questions fréquentes" numbered={false} sections={[]}>
      <Reserved />
    </LegalPage>
  );
}

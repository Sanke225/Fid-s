import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { Reserved } from '@/components/legal/Reserved';

export const metadata: Metadata = {
  title: 'Mentions légales · Fid’s',
  description: 'Éditeur, directeur de la publication et hébergeur de Fid’s.',
};

// Contenu réservé à Roxane (rédaction en cours).
export default function MentionsLegalesPage() {
  return (
    <LegalPage eyebrow="Informations légales" title="Mentions légales" numbered={false} sections={[]}>
      <Reserved />
    </LegalPage>
  );
}

import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { Reserved } from '@/components/legal/Reserved';

export const metadata: Metadata = {
  title: 'Nous contacter · Fid’s',
  description: 'Contacter l’équipe Fid’s.',
};

// Contenu réservé à Roxane (rédaction en cours).
export default function ContactPage() {
  return (
    <LegalPage eyebrow="Support" title="Nous contacter" numbered={false} sections={[]}>
      <Reserved />
    </LegalPage>
  );
}

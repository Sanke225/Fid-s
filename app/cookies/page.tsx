import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';
import { Reserved } from '@/components/legal/Reserved';

export const metadata: Metadata = {
  title: 'Cookies · Fid’s',
  description: 'Cookies et stockages utilisés par Fid’s.',
};

// Contenu réservé à Roxane (rédaction en cours).
export default function CookiesPage() {
  return (
    <LegalPage eyebrow="Données personnelles" title="Cookies" numbered={false} sections={[]}>
      <Reserved />
    </LegalPage>
  );
}

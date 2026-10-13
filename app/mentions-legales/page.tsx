import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoRow, LegalPage } from '@/components/legal/LegalPage';
import { COMPANY } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Mentions légales · Fid’s',
  description: 'Éditeur, directeur de la publication et hébergeur de la plateforme Fid’s.',
};

export default function MentionsLegalesPage() {
  return (
    <LegalPage
      eyebrow="Informations légales"
      title="Mentions légales"
      intro={
        <p>
          Conformément à la loi n° 2013-546 du 30 juillet 2013 relative aux transactions électroniques, voici l’identité des personnes qui éditent et hébergent la plateforme Fid’s.
        </p>
      }
      sections={[
        {
          id: 'editeur',
          title: 'Éditeur de la plateforme',
          body: (
            <dl>
              <InfoRow label="Raison sociale">{COMPANY.name}</InfoRow>
              <InfoRow label="Forme juridique">{COMPANY.legalForm}</InfoRow>
              <InfoRow label="RCCM">{COMPANY.rccm}</InfoRow>
              <InfoRow label="Compte contribuable">{COMPANY.taxId}</InfoRow>
              <InfoRow label="Siège social">{COMPANY.address}</InfoRow>
              <InfoRow label="Téléphone">{COMPANY.phone}</InfoRow>
              <InfoRow label="E-mail">
                <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
              </InfoRow>
            </dl>
          ),
        },
        {
          id: 'directeur',
          title: 'Directeur de la publication',
          body: (
            <dl>
              <InfoRow label="Nom">{COMPANY.director}</InfoRow>
              <InfoRow label="Contact">
                <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
              </InfoRow>
            </dl>
          ),
        },
        {
          id: 'hebergeur',
          title: 'Hébergeur',
          body: (
            <>
              <dl>
                <InfoRow label="Nom">{COMPANY.host.name}</InfoRow>
                <InfoRow label="Adresse">{COMPANY.host.address}</InfoRow>
                <InfoRow label="Contact">{COMPANY.host.contact}</InfoRow>
              </dl>
              <p>
                La plateforme, les démos et les applications remises aux clients sont hébergées sur les serveurs de cet hébergeur.
              </p>
            </>
          ),
        },
        {
          id: 'propriete',
          title: 'Propriété intellectuelle',
          body: (
            <>
              <p>
                Le nom Fid’s, le logo, la charte graphique, les textes et l’interface de la plateforme appartiennent à l’éditeur. Toute reproduction sans autorisation écrite est interdite.
              </p>
              <p>
                Les applications déposées par les développeurs restent leur propriété, puis celle de leurs clients après la passation, dans les conditions prévues par les <Link href="/cgu">Conditions d’utilisation</Link>.
              </p>
            </>
          ),
        },
        {
          id: 'signalement',
          title: 'Signaler un contenu',
          body: (
            <p>
              Pour signaler un contenu illicite, une application malveillante ou une fraude, écrivez à <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> en précisant le lien concerné. La procédure est décrite dans les <Link href="/regles">Règles d’utilisation</Link>.
            </p>
          ),
        },
      ]}
    />
  );
}

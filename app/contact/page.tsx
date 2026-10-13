import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoRow, LegalPage } from '@/components/legal/LegalPage';
import { COMPANY } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Nous contacter · Fid’s',
  description: 'Contacter l’équipe Fid’s : e-mail, WhatsApp et délai de réponse.',
};

export default function ContactPage() {
  return (
    <LegalPage
      eyebrow="Support"
      title="Nous contacter"
      numbered={false}
      summary={
        <p>
          Écrivez-nous à <a href={`mailto:${COMPANY.email}`} className="font-semibold underline">{COMPANY.email}</a>. Nous répondons sous {COMPANY.responseTime}.
        </p>
      }
      sections={[
        {
          id: 'moyens',
          title: 'Moyens de contact',
          body: (
            <dl>
              <InfoRow label="E-mail">
                <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
              </InfoRow>
              <InfoRow label="WhatsApp">{COMPANY.whatsapp}</InfoRow>
              <InfoRow label="Délai de réponse">{COMPANY.responseTime}</InfoRow>
              <InfoRow label="Adresse">{COMPANY.address}</InfoRow>
            </dl>
          ),
        },
        {
          id: 'message',
          title: 'Pour une réponse plus rapide',
          body: (
            <>
              <p>Indiquez dans votre message :</p>
              <ul>
                <li>votre nom et l’adresse e-mail ou l’identifiant de votre compte ;</li>
                <li>si vous êtes développeur ou client ;</li>
                <li>le nom du projet ou le lien de la livraison concernée ;</li>
                <li>pour un paiement : l’opérateur, la date et la référence de transaction reçue par SMS.</li>
              </ul>
              <p>Ne nous envoyez jamais votre mot de passe ni votre code secret Mobile Money : l’équipe Fid’s ne vous les demandera jamais.</p>
            </>
          ),
        },
        {
          id: 'paiement',
          title: 'Un problème de paiement avec un développeur',
          body: (
            <p>
              Si le développeur refuse votre paiement ou ne répond pas sous 48 heures, ouvrez un litige depuis votre page de livraison ou votre espace client : c’est plus rapide qu’un e-mail, car vos preuves et l’historique y sont déjà rattachés. Voir le <Link href="/litiges">Règlement des litiges</Link>.
            </p>
          ),
        },
        {
          id: 'donnees',
          title: 'Vos données personnelles',
          body: (
            <p>
              Pour exercer vos droits (accès, rectification, suppression, opposition), écrivez à <a href={`mailto:${COMPANY.privacyEmail}`}>{COMPANY.privacyEmail}</a>. Vous pouvez aussi exporter vos données ou supprimer votre compte vous-même depuis votre profil. Voir la <Link href="/confidentialite">Politique de confidentialité</Link>.
            </p>
          ),
        },
        {
          id: 'aide',
          title: 'Avant de nous écrire',
          body: (
            <p>
              La réponse se trouve peut-être déjà dans la <Link href="/faq">FAQ</Link> : frais de service, opérateurs acceptés, délais, suppression du compte.
            </p>
          ),
        },
      ]}
    />
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/legal/LegalPage';
import { COMPANY } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Règlement des litiges · Fid’s',
  description: 'Ouvrir un litige sur un paiement, délais de réponse du développeur, décision de l’administration sur preuves et recours.',
};

export default function LitigesPage() {
  return (
    <LegalPage
      eyebrow="Paiements et livraison"
      title="Règlement des litiges"
      summary={
        <p>
          Vous avez payé le développeur, mais il refuse votre paiement ou ne répond pas sous 48 heures ? Ouvrez un litige avec vos preuves. Le développeur a 48 heures pour répondre, puis l’administration de Fid’s tranche. Chaque étape est enregistrée.
        </p>
      }
      sections={[
        {
          id: 'champ',
          title: 'Quels désaccords sont concernés',
          body: (
            <>
              <p>
                Cette procédure traite un seul type de désaccord : <strong>le client affirme avoir payé le développeur, et le développeur ne confirme pas ce paiement</strong>.
              </p>
              <p>
                Elle ne sert pas à juger la qualité de l’application. Le client teste la démo <strong>avant</strong> de payer : si elle ne lui convient pas, il ne paie pas et la démo expire, sans engagement. Les désaccords sur le contenu de la commande se règlent directement entre le développeur et le client.
              </p>
            </>
          ),
        },
        {
          id: 'ouvrir',
          title: 'Quand et comment ouvrir un litige',
          body: (
            <>
              <p>Le client peut ouvrir un litige dans deux cas :</p>
              <ul>
                <li>le développeur a <strong>refusé</strong> le paiement déclaré (il indique ne rien avoir reçu) ;</li>
                <li>le développeur <strong>n’a pas répondu sous 48 heures</strong> après la déclaration du paiement.</li>
              </ul>
              <p>
                Le litige s’ouvre depuis la page de livraison, sur l’appareil qui a déclaré le paiement, ou depuis l’espace client. Le client explique la situation (10 caractères minimum) et fournit ses preuves : capture du SMS de confirmation de l’opérateur, référence de transaction, date et numéro utilisés.
              </p>
              <p>Un seul litige est possible par paiement.</p>
            </>
          ),
        },
        {
          id: 'reponse',
          title: 'La réponse du développeur',
          body: (
            <>
              <p>Dès l’ouverture du litige, le développeur est prévenu et dispose de <strong>48 heures</strong> pour répondre. Il peut :</p>
              <ul>
                <li><strong>reconnaître le paiement</strong> : le paiement est alors confirmé, le litige est clos et la livraison reprend son cours ;</li>
                <li><strong>maintenir son refus</strong>, en expliquant pourquoi et en joignant ses propres preuves (historique des transactions reçues, par exemple).</li>
              </ul>
              <p>Pendant ce délai, l’administration ne peut pas trancher : le développeur doit pouvoir s’expliquer.</p>
            </>
          ),
        },
        {
          id: 'decision',
          title: 'La décision de l’administration',
          body: (
            <>
              <p>
                Si le développeur maintient son refus, ou ne répond pas dans les 48 heures, l’administration de Fid’s examine les preuves des deux parties et le journal de la livraison. Elle peut :
              </p>
              <ul>
                <li><strong>reconnaître le paiement</strong> à la place du développeur : la livraison suit alors son cours (frais de service, puis remise de l’application) ;</li>
                <li><strong>refuser le paiement</strong> : la livraison n’est pas débloquée.</li>
              </ul>
              <p>
                Chaque décision est <strong>motivée</strong>, communiquée aux deux parties et enregistrée dans le journal de la livraison avec son auteur et sa date.
              </p>
              <p>
                L’administration ne touche jamais au paiement destiné au développeur : elle ne peut ni l’encaisser, ni le reverser, ni le rembourser. Elle décide seulement si l’application peut être remise au client.
              </p>
            </>
          ),
        },
        {
          id: 'frais',
          title: 'Frais de service refusés',
          body: (
            <p>
              Si Fid’s ne constate pas la réception de ses frais de service de 5 %, la déclaration est refusée avec un motif. Le client peut vérifier son envoi et déclarer à nouveau. En cas de doute, il écrit au <Link href="/contact">support</Link> avec sa référence de transaction.
            </p>
          ),
        },
        {
          id: 'fraude',
          title: 'Fausses déclarations',
          body: (
            <p>
              Déclarer une référence de transaction inventée, ou nier un paiement réellement reçu, est une fraude. Elle entraîne la suspension du compte concerné et peut être signalée aux autorités, conformément aux <Link href="/regles">Règles d’utilisation</Link> et à la loi n° 2013-451 relative à la lutte contre la cybercriminalité.
            </p>
          ),
        },
        {
          id: 'recours',
          title: 'Recours',
          body: (
            <>
              <p>
                Une partie qui conteste la décision peut demander son réexamen en écrivant à <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> dans les 15 jours, avec tout élément nouveau.
              </p>
              <p>
                La procédure de Fid’s ne prive personne de ses droits : le développeur et le client restent libres de régler leur différend à l’amiable ou devant les juridictions compétentes d’Abidjan. Le journal de la livraison tenu par Fid’s peut alors être produit à titre de preuve.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}

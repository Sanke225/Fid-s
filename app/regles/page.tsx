import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/legal/LegalPage';
import { COMPANY } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Règles d’utilisation · Fid’s',
  description: 'Projets et contenus interdits sur Fid’s, fraude aux paiements, sanctions et signalement.',
};

export default function ReglesPage() {
  return (
    <LegalPage
      eyebrow="Cadre contractuel"
      title="Règles d’utilisation acceptable"
      summary={
        <p>
          Fid’s fait tourner le code des développeurs sur ses serveurs et met en relation des personnes qui se paient entre elles. Ces règles protègent tout le monde. Les enfreindre peut entraîner la suspension immédiate du compte.
        </p>
      }
      sections={[
        {
          id: 'projets',
          title: 'Projets et contenus interdits',
          body: (
            <>
              <p>Il est interdit de déposer ou de livrer par Fid’s une application qui :</p>
              <ul>
                <li>est illicite en Côte d’Ivoire ou sert une activité illicite (jeux d’argent non autorisés, vente de produits interdits, escroquerie…) ;</li>
                <li>porte atteinte aux droits d’autrui : contrefaçon, code ou contenus copiés sans licence, usurpation de marque ou d’identité ;</li>
                <li>diffuse des contenus haineux, violents, pédopornographiques ou portant atteinte à la dignité humaine ;</li>
                <li>collecte des données personnelles à l’insu des personnes ou en violation de la loi n° 2013-450.</li>
              </ul>
            </>
          ),
        },
        {
          id: 'malveillant',
          title: 'Code malveillant et atteinte à la plateforme',
          body: (
            <>
              <p>Il est interdit de déposer du code qui :</p>
              <ul>
                <li>contient un virus, une porte dérobée, un rançongiciel, un logiciel espion ou un composant de minage de cryptomonnaie ;</li>
                <li>cherche à sortir de son conteneur, à accéder aux autres démos, à la base de données de Fid’s ou au serveur ;</li>
                <li>surcharge volontairement les ressources (mémoire, processeur, disque) ou attaque un autre service ;</li>
                <li>se comporte autrement dans la démo et dans l’application remise au client, pour le tromper.</li>
              </ul>
              <p>Il est aussi interdit de tenter de contourner les contrôles de Fid’s : accéder à une livraison qui n’est pas la sienne, débloquer une application sans paiement confirmé, ou exploiter une faille au lieu de la signaler.</p>
            </>
          ),
        },
        {
          id: 'fraude',
          title: 'Fraude aux paiements',
          body: (
            <>
              <p>Sont notamment considérés comme des fraudes :</p>
              <ul>
                <li>déclarer un paiement jamais effectué, ou une <strong>fausse référence de transaction</strong> ;</li>
                <li>réutiliser la référence d’un autre paiement ou d’une autre personne ;</li>
                <li>pour un développeur, <strong>nier un paiement réellement reçu</strong> afin d’obtenir un second paiement ;</li>
                <li>enregistrer comme numéro de réception un numéro qui n’appartient pas au développeur ;</li>
                <li>falsifier une capture d’écran ou une preuve fournie lors d’un litige.</li>
              </ul>
              <p>Chaque référence de transaction ne peut être utilisée qu’une fois par opérateur, et toutes les déclarations sont enregistrées avec leur auteur et leur date.</p>
            </>
          ),
        },
        {
          id: 'comptes',
          title: 'Comptes',
          body: (
            <ul>
              <li>Un compte correspond à une personne ou une entreprise réelle, avec des informations exactes.</li>
              <li>Les identifiants sont personnels : ne les partagez pas et prévenez-nous en cas d’usage suspect.</li>
              <li>Il est interdit d’usurper l’identité d’un tiers ou de créer des comptes pour contourner une suspension.</li>
              <li>Le développeur qui crée le compte de son client lui transmet ses identifiants de façon confidentielle et ne s’en sert pas lui-même.</li>
            </ul>
          ),
        },
        {
          id: 'sanctions',
          title: 'Sanctions',
          body: (
            <>
              <p>Selon la gravité, Fid’s peut :</p>
              <ul>
                <li>adresser un avertissement ;</li>
                <li>arrêter une démo et supprimer le code déposé ;</li>
                <li>suspendre ou fermer le compte ;</li>
                <li>signaler les faits aux autorités compétentes, notamment au titre de la loi n° 2013-451 relative à la lutte contre la cybercriminalité.</li>
              </ul>
              <p>L’utilisateur est informé de la mesure et de son motif, sauf urgence ou demande des autorités. Il peut la contester en écrivant au <Link href="/contact">support</Link>.</p>
            </>
          ),
        },
        {
          id: 'signaler',
          title: 'Signaler un abus',
          body: (
            <p>
              Si vous constatez une application malveillante, une fraude ou une faille de sécurité, écrivez à <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> avec le lien concerné et une description. Les signalements de failles faits de bonne foi ne donnent lieu à aucune poursuite de la part de Fid’s.
            </p>
          ),
        },
      ]}
    />
  );
}

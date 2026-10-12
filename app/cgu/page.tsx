import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Conditions générales d’utilisation · Fid’s',
  description: 'Règles d’utilisation de la plateforme Fid’s par les développeurs et leurs clients.',
};

export default function CguPage() {
  return (
    <LegalPage
      eyebrow="Cadre contractuel"
      title="Conditions générales d’utilisation"
      summary={
        <p>
          Fid’s protège les développeurs et leurs clients. Le développeur ne remet pas son application avant d’être payé, et le client ne paie pas avant de l’avoir testée sur une démo hébergée par Fid’s. Fid’s ne détient jamais l’argent du développeur.
        </p>
      }
      sections={[
        {
          id: 'objet',
          title: 'Objet du service',
          body: (
            <>
              <p>
                La plateforme <strong>Fid’s</strong> est un tiers de confiance technique qui sécurise la livraison de logiciels sur mesure (applications web, mobiles, scripts, API) réalisés par des développeurs pour leurs clients.
              </p>
              <p>
                Fid’s héberge temporairement une démo de l’application, puis la remet au client (accès, base de données et, si prévu, code source) une fois le paiement au développeur et les frais de service de Fid’s confirmés.
              </p>
              <p>
                <strong>Fid’s n’est ni une banque, ni un établissement de paiement, ni un compte séquestre.</strong> Le client paie le développeur directement par Mobile Money ; seuls les frais de service de 5 %, dus par le client, sont versés à Fid’s (voir les <Link href="/cf">Conditions financières</Link>).
              </p>
            </>
          ),
        },
        {
          id: 'definitions',
          title: 'Définitions',
          body: (
            <ul>
              <li><strong>Développeur :</strong> développeur indépendant, agence ou studio qui crée un projet et dépose son application sur Fid’s.</li>
              <li><strong>Client :</strong> personne physique ou morale qui a commandé le logiciel, le teste et le paie.</li>
              <li><strong>Démo :</strong> environnement temporaire et cloisonné qui exécute l’application pour l’essayer sans accéder au code source.</li>
              <li><strong>Passation :</strong> remise de l’application au client (accès, base de données, code source si prévu) après confirmation des paiements.</li>
              <li><strong>Administration :</strong> l’équipe Fid’s, qui confirme les frais de service et tranche les litiges sur preuves.</li>
            </ul>
          ),
        },
        {
          id: 'compte',
          title: 'Création de compte',
          body: (
            <>
              <p>
                L’espace développeur et l’espace client nécessitent un compte, créé par adresse e-mail et mot de passe ou par un fournisseur de connexion (Google, GitHub). À l’inscription, l’utilisateur choisit son type de compte (développeur ou client) et accepte les présentes conditions et la <Link href="/confidentialite">Politique de confidentialité</Link>.
              </p>
              <p>
                Un développeur peut créer le compte de son client avec un identifiant et un mot de passe provisoire. Le client choisit alors son propre mot de passe à sa première connexion et accepte ces conditions à ce moment. Un client peut aussi recevoir sa livraison sans compte, par le lien privé que lui transmet le développeur.
              </p>
              <p>
                Chaque utilisateur fournit des informations exactes et garde ses identifiants secrets. Le développeur enregistre lui-même les numéros Mobile Money sur lesquels ses clients le paient et reste seul responsable de leur exactitude.
              </p>
            </>
          ),
        },
        {
          id: 'propriete',
          title: 'Propriété intellectuelle et cession des droits',
          body: (
            <>
              <p>
                <strong>Avant le paiement :</strong> le développeur reste seul propriétaire du code source, de la logique logicielle et des éléments graphiques de l’application.
              </p>
              <p>
                <strong>Après le paiement :</strong> dès que le développeur a confirmé avoir reçu le paiement (ou que l’administration l’a reconnu en cas de litige) et que Fid’s a confirmé la réception de ses frais de service, les droits patrimoniaux sur l’application sont cédés au client, dans les limites convenues entre les parties.
              </p>
              <p>Fid’s n’acquiert aucun droit sur les applications déposées : elle les héberge uniquement pour la démo et la passation.</p>
            </>
          ),
        },
        {
          id: 'engagements',
          title: 'Engagements des utilisateurs',
          body: (
            <>
              <p>
                Il est interdit de déposer du code contenant des portes dérobées, des logiciels malveillants, des composants de minage, ou tout élément qui porte atteinte au client ou à l’infrastructure de Fid’s. Il est également interdit de déclarer un paiement fictif. La liste complète figure dans les <Link href="/regles">Règles d’utilisation</Link>.
              </p>
              <p>
                En cas de manquement, Fid’s peut suspendre la livraison ou le compte concerné, après en avoir informé l’utilisateur sauf urgence, et signaler les faits aux autorités compétentes.
              </p>
            </>
          ),
        },
        {
          id: 'litiges',
          title: 'Litiges entre développeur et client',
          body: (
            <>
              <p>
                Le client teste l’application <strong>avant</strong> de payer : si la démo ne correspond pas à ce qui était convenu, il ne paie pas et la démo expire, sans engagement. Les désaccords sur un paiement se traitent par ticket, selon le <Link href="/litiges">Règlement des litiges</Link>.
              </p>
              <p>Le journal de la livraison tenu par Fid’s (déclarations, confirmations, tickets, décisions) peut être produit entre les parties à titre de preuve.</p>
            </>
          ),
        },
        {
          id: 'responsabilite',
          title: 'Responsabilité de Fid’s',
          body: (
            <>
              <p>
                Fid’s s’engage à mettre en œuvre les moyens raisonnables pour assurer la disponibilité et la sécurité de la plateforme, sans garantir un fonctionnement ininterrompu. Fid’s n’est pas partie au contrat entre le développeur et le client : elle ne répond ni de la qualité de l’application livrée, ni de son adéquation aux besoins du client.
              </p>
              <p>Fid’s ne répond pas des incidents propres aux opérateurs Mobile Money (retards, erreurs de numéro, frais de l’opérateur).</p>
            </>
          ),
        },
        {
          id: 'donnees',
          title: 'Données personnelles',
          body: (
            <p>
              Fid’s traite les données des utilisateurs conformément à la loi ivoirienne n° 2013-450 relative à la protection des données à caractère personnel. Le détail des données collectées, de leur durée de conservation et des droits de chacun figure dans la <Link href="/confidentialite">Politique de confidentialité</Link>. Chaque utilisateur peut exporter ses données ou supprimer son compte depuis son profil.
            </p>
          ),
        },
        {
          id: 'modification',
          title: 'Modification des conditions',
          body: (
            <p>
              Fid’s peut faire évoluer ces conditions. La date de mise à jour figure en haut de la page ; en cas de changement important, les utilisateurs en sont informés et invités à accepter la nouvelle version à leur prochaine connexion.
            </p>
          ),
        },
        {
          id: 'droit',
          title: 'Droit applicable et juridiction',
          body: (
            <p>
              Les présentes conditions sont régies par le droit de la République de Côte d’Ivoire, notamment la loi n° 2013-546 relative aux transactions électroniques. À défaut d’accord amiable, tout différend relève des juridictions compétentes d’Abidjan.
            </p>
          ),
        },
      ]}
    />
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { InfoRow, LegalPage } from '@/components/legal/LegalPage';
import { COMPANY } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Politique de confidentialité · Fid’s',
  description: 'Données collectées par Fid’s, finalités, durées de conservation, destinataires, transferts et droits des utilisateurs.',
};

export default function ConfidentialitePage() {
  return (
    <LegalPage
      eyebrow="Vie privée"
      title="Politique de confidentialité"
      summary={
        <p>
          Fid’s collecte uniquement ce qui sert à sécuriser la livraison d’une application : votre identité, vos coordonnées, vos numéros Mobile Money et les références de vos paiements. Nous ne vendons aucune donnée et n’utilisons aucun traceur publicitaire. Vous pouvez exporter vos données ou supprimer votre compte depuis votre profil.
        </p>
      }
      intro={
        <p>
          Cette politique explique comment Fid’s traite vos données à caractère personnel, conformément à la loi ivoirienne n° 2013-450 du 19 juin 2013 relative à la protection des données à caractère personnel, sous le contrôle de l’Autorité de Régulation des Télécommunications/TIC de Côte d’Ivoire (ARTCI).
        </p>
      }
      sections={[
        {
          id: 'responsable',
          title: 'Responsable du traitement',
          body: (
            <dl>
              <InfoRow label="Responsable">{COMPANY.name}</InfoRow>
              <InfoRow label="Adresse">{COMPANY.address}</InfoRow>
              <InfoRow label="Contact données personnelles">
                <a href={`mailto:${COMPANY.privacyEmail}`}>{COMPANY.privacyEmail}</a>
              </InfoRow>
            </dl>
          ),
        },
        {
          id: 'donnees',
          title: 'Les données que nous collectons',
          body: (
            <table>
              <thead>
                <tr>
                  <th>Catégorie</th>
                  <th>Données</th>
                  <th>Personnes concernées</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Compte</td>
                  <td>Nom, adresse e-mail, mot de passe (enregistré uniquement sous forme chiffrée irréversible), type de compte, téléphone et nom commercial s’ils sont renseignés, identifiant de connexion pour les comptes créés par un développeur</td>
                  <td>Développeurs, clients</td>
                </tr>
                <tr>
                  <td>Connexion Google ou GitHub</td>
                  <td>Nom, adresse e-mail et photo de profil transmis par Google ou GitHub, identifiant du compte chez ce fournisseur</td>
                  <td>Utilisateurs qui choisissent ce mode de connexion</td>
                </tr>
                <tr>
                  <td>Liaison GitHub du développeur</td>
                  <td>Nom du compte GitHub et accès en lecture seule aux dépôts choisis</td>
                  <td>Développeurs</td>
                </tr>
                <tr>
                  <td>Moyens de paiement du développeur</td>
                  <td>Opérateur (Wave, Orange Money, Moov Money, MTN MoMo), numéro de réception et libellé</td>
                  <td>Développeurs</td>
                </tr>
                <tr>
                  <td>Paiements déclarés</td>
                  <td>Nom et numéro du payeur, opérateur, montant, référence de transaction reçue par SMS, dates de déclaration et de confirmation</td>
                  <td>Clients</td>
                </tr>
                <tr>
                  <td>Litiges</td>
                  <td>Explications et preuves fournies par le client et le développeur, décision de l’administration</td>
                  <td>Développeurs, clients</td>
                </tr>
                <tr>
                  <td>Sécurité et journal</td>
                  <td>Adresse IP et navigateur liés à la session, journal des actions sur chaque livraison (dépôt, déclaration, confirmation, décision)</td>
                  <td>Tous les utilisateurs</td>
                </tr>
                <tr>
                  <td>Consentement</td>
                  <td>Version des conditions acceptée et date d’acceptation</td>
                  <td>Tous les utilisateurs</td>
                </tr>
              </tbody>
            </table>
          ),
        },
        {
          id: 'finalites',
          title: 'Pourquoi nous les utilisons, et sur quelle base légale',
          body: (
            <table>
              <thead>
                <tr>
                  <th>Finalité</th>
                  <th>Base légale</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Créer et gérer votre compte, vous connecter</td>
                  <td>Exécution du contrat (Conditions d’utilisation)</td>
                </tr>
                <tr>
                  <td>Héberger la démo, suivre les paiements déclarés et remettre l’application au client</td>
                  <td>Exécution du contrat</td>
                </tr>
                <tr>
                  <td>Traiter les litiges sur preuves</td>
                  <td>Exécution du contrat et intérêt légitime de Fid’s à garantir des échanges loyaux</td>
                </tr>
                <tr>
                  <td>Prévenir la fraude (fausses références de transaction, comptes frauduleux) et sécuriser la plateforme</td>
                  <td>Intérêt légitime de Fid’s et de ses utilisateurs</td>
                </tr>
                <tr>
                  <td>Émettre les factures et les conserver</td>
                  <td>Obligation légale (comptable et fiscale)</td>
                </tr>
                <tr>
                  <td>Vous envoyer les e-mails du service (vérification d’adresse, suivi d’une livraison)</td>
                  <td>Exécution du contrat</td>
                </tr>
                <tr>
                  <td>Vous connecter avec Google ou GitHub</td>
                  <td>Votre consentement, donné en choisissant ce mode de connexion</td>
                </tr>
              </tbody>
            </table>
          ),
        },
        {
          id: 'destinataires',
          title: 'Qui peut voir vos données',
          body: (
            <>
              <p>Vos données ne sont jamais vendues ni louées. Elles ne sont communiquées qu’aux personnes qui en ont besoin :</p>
              <ul>
                <li>
                  <strong>Entre développeur et client d’une même livraison :</strong> le client voit le nom du développeur et les numéros Mobile Money sur lesquels il peut le payer ; le développeur voit le nom, le numéro et la référence de transaction déclarés par le client, ainsi que le nom et l’e-mail de son client lorsqu’il est rattaché au projet.
                </li>
                <li>
                  <strong>L’administration de Fid’s :</strong> elle accède aux paiements, frais et litiges pour confirmer les frais de service et trancher les désaccords.
                </li>
                <li>
                  <strong>Nos prestataires techniques :</strong> l’hébergeur ({COMPANY.host.name}), le service d’envoi d’e-mails, et Google ou GitHub si vous les utilisez pour vous connecter.
                </li>
                <li>
                  <strong>Les autorités :</strong> sur demande légale (autorité judiciaire, ARTCI), dans les limites prévues par la loi.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: 'transferts',
          title: 'Transferts hors de Côte d’Ivoire',
          body: (
            <>
              <p>
                Certaines données peuvent être traitées hors de Côte d’Ivoire : par <strong>Google</strong> et <strong>GitHub</strong> (États-Unis) lorsque vous vous connectez avec eux ou liez vos dépôts, et par notre hébergeur si ses serveurs sont situés à l’étranger.
              </p>
              <p>
                Ces transferts sont limités au strict nécessaire et encadrés conformément à la loi n° 2013-450 et aux autorisations de l’ARTCI. Vous pouvez éviter tout transfert à Google ou GitHub en créant un compte par e-mail et mot de passe.
              </p>
            </>
          ),
        },
        {
          id: 'durees',
          title: 'Combien de temps nous les gardons',
          body: (
            <table>
              <thead>
                <tr>
                  <th>Données</th>
                  <th>Durée</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Compte</td>
                  <td>Tant que le compte est ouvert. À la suppression, les données personnelles sont effacées immédiatement.</td>
                </tr>
                <tr>
                  <td>Sessions de connexion (adresse IP, navigateur)</td>
                  <td>7 jours après la dernière activité, supprimées à la déconnexion ou à la suppression du compte</td>
                </tr>
                <tr>
                  <td>Démo et code déposé d’une livraison non payée</td>
                  <td>Supprimés à l’expiration de la livraison, 30 jours après le dernier dépôt</td>
                </tr>
                <tr>
                  <td>Paiements, frais, factures et journal des livraisons</td>
                  <td>10 ans, au titre des obligations comptables et de la preuve en cas de litige. Après suppression du compte, ils restent rattachés à un compte anonymisé.</td>
                </tr>
                <tr>
                  <td>Litiges</td>
                  <td>Jusqu’à leur clôture, puis 5 ans pour la preuve</td>
                </tr>
                <tr>
                  <td>Sauvegardes de la plateforme</td>
                  <td>7 jours, en rotation</td>
                </tr>
              </tbody>
            </table>
          ),
        },
        {
          id: 'securite',
          title: 'Sécurité',
          body: (
            <ul>
              <li>Mots de passe enregistrés uniquement sous forme chiffrée irréversible.</li>
              <li>Code source et variables d’environnement des développeurs chiffrés, accessibles seulement le temps d’une installation.</li>
              <li>Chaque démo tourne dans un conteneur isolé, sans accès aux données de la plateforme.</li>
              <li>Connexion chiffrée (HTTPS), accès de l’administration réservé et journalisé.</li>
            </ul>
          ),
        },
        {
          id: 'droits',
          title: 'Vos droits et comment les exercer',
          body: (
            <>
              <p>Conformément à la loi n° 2013-450, vous disposez des droits suivants :</p>
              <ul>
                <li><strong>Accès :</strong> obtenir une copie de vos données. Depuis votre profil, « Exporter mes données » télécharge immédiatement un fichier complet.</li>
                <li><strong>Rectification :</strong> corriger vos informations depuis votre profil, ou en nous écrivant.</li>
                <li><strong>Suppression :</strong> supprimer votre compte depuis votre profil. La suppression est possible dès qu’aucune livraison n’est en cours de paiement ou de remise et qu’aucun litige n’est ouvert ; les paiements et factures sont conservés sans vos données personnelles.</li>
                <li><strong>Opposition :</strong> vous opposer à un traitement fondé sur notre intérêt légitime, pour un motif tenant à votre situation.</li>
              </ul>
              <p>
                Pour toute demande, écrivez à <a href={`mailto:${COMPANY.privacyEmail}`}>{COMPANY.privacyEmail}</a> depuis l’adresse liée à votre compte. Nous répondons dans un délai d’un mois. Si vous estimez que vos droits ne sont pas respectés, vous pouvez saisir l’<strong>ARTCI</strong> (www.artci.ci).
              </p>
            </>
          ),
        },
        {
          id: 'cookies',
          title: 'Cookies',
          body: (
            <p>
              Fid’s n’utilise que des cookies et un stockage local techniques, nécessaires au service. Le détail figure dans la <Link href="/cookies">Politique cookies</Link>.
            </p>
          ),
        },
        {
          id: 'modification',
          title: 'Modification de cette politique',
          body: (
            <p>
              En cas de changement important, la date en haut de cette page est mise à jour et vous êtes invité à accepter la nouvelle version à votre prochaine connexion, comme pour les <Link href="/cgu">Conditions d’utilisation</Link>.
            </p>
          ),
        },
      ]}
    />
  );
}

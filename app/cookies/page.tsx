import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/legal/LegalPage';
import { COMPANY } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Politique cookies · Fid’s',
  description: 'Les cookies et le stockage local utilisés par Fid’s : uniquement des éléments techniques nécessaires.',
};

/** Cookies et entrées du stockage local réellement posés par Fid’s (à tenir à jour avec le code). */
const TRACES = [
  {
    name: 'Cookie de session',
    code: 'better-auth.session_token',
    kind: 'Cookie',
    purpose: 'Vous garder connecté à votre compte de manière sécurisée.',
    duration: '7 jours, renouvelé quand vous utilisez le site ; supprimé à la déconnexion.',
  },
  {
    name: 'Cookies de connexion Google ou GitHub',
    code: null,
    kind: 'Cookie',
    purpose: 'Vérifier que le retour de Google ou GitHub correspond bien à votre demande de connexion (protection contre la falsification).',
    duration: 'Quelques minutes, le temps de la connexion.',
  },
  {
    name: 'Cookie d’aperçu',
    code: 'fids_apercu',
    kind: 'Cookie',
    purpose: 'Vous donner accès à l’aperçu d’une application (« Voir l’application ») sans exposer votre session Fid’s.',
    duration: '8 heures.',
  },
  {
    name: 'Thème',
    code: 'fids_theme',
    kind: 'Stockage local',
    purpose: 'Retenir votre choix entre le thème clair et le thème sombre.',
    duration: 'Jusqu’à ce que vous vidiez les données du site.',
  },
  {
    name: 'Jeton payeur',
    code: 'recette.payer.…',
    kind: 'Stockage local',
    purpose: 'Prouver que cet appareil a déclaré le paiement d’une livraison, pour suivre son état et recevoir l’application sans compte.',
    duration: 'Jusqu’à ce que vous vidiez les données du site.',
  },
] as const;

export default function CookiesPage() {
  return (
    <LegalPage
      eyebrow="Vie privée"
      title="Politique cookies"
      summary={
        <p>
          Fid’s n’utilise <strong>aucun cookie publicitaire ni de mesure d’audience</strong>. Seuls des éléments techniques, indispensables au fonctionnement du service, sont déposés sur votre appareil. Ils ne demandent donc pas votre consentement.
        </p>
      }
      sections={[
        {
          id: 'definition',
          title: 'Cookies et stockage local',
          body: (
            <>
              <p>
                Un <strong>cookie</strong> est un petit fichier que le site enregistre dans votre navigateur et qu’il relit à chaque visite. Le <strong>stockage local</strong> (localStorage) fonctionne de la même façon, mais ses données ne sont jamais envoyées automatiquement au serveur.
              </p>
              <p>Fid’s utilise les deux, uniquement pour vous garder connecté, sécuriser les paiements et retenir vos préférences d’affichage.</p>
            </>
          ),
        },
        {
          id: 'liste',
          title: 'Ce que Fid’s dépose sur votre appareil',
          body: (
            <ul className="!list-none !pl-0 grid gap-3">
              {TRACES.map(t => (
                <li key={t.name} className="!mt-0 rounded-3xl border border-f-line bg-f-card p-4">
                  <p className="font-semibold">
                    {t.name}
                    {t.code ? <> (<code>{t.code}</code>)</> : null}
                  </p>
                  <dl className="mt-2 grid gap-1 text-[14.5px]">
                    <div><dt className="inline font-semibold text-f-muted">Type : </dt><dd className="inline">{t.kind}</dd></div>
                    <div><dt className="inline font-semibold text-f-muted">Rôle : </dt><dd className="inline">{t.purpose}</dd></div>
                    <div><dt className="inline font-semibold text-f-muted">Durée : </dt><dd className="inline">{t.duration}</dd></div>
                  </dl>
                </li>
              ))}
            </ul>
          ),
        },
        {
          id: 'tiers',
          title: 'Aucun cookie tiers',
          body: (
            <p>
              Fid’s n’intègre ni publicité, ni bouton de réseau social, ni outil de statistiques. Les seuls services extérieurs sollicités sont Google et GitHub, et uniquement si vous choisissez de vous connecter avec eux : leurs propres cookies sont alors régis par leurs politiques.
            </p>
          ),
        },
        {
          id: 'controle',
          title: 'Comment les supprimer',
          body: (
            <>
              <p>
                Vous pouvez effacer les cookies et le stockage local à tout moment depuis les réglages de votre navigateur (rubrique « Confidentialité » ou « Données de navigation »).
              </p>
              <p>
                Attention : sans le cookie de session, vous serez déconnecté ; sans le jeton payeur, un appareil qui a payé sans compte ne pourra plus suivre sa livraison. Dans ce cas, connectez-vous à votre compte client ou <Link href="/contact">contactez le support</Link>.
              </p>
            </>
          ),
        },
        {
          id: 'evolution',
          title: 'Évolution de cette politique',
          body: (
            <p>
              Si Fid’s ajoute un jour des statistiques de fréquentation ou tout autre cookie non indispensable, un bandeau vous demandera votre accord avant leur dépôt, et cette page sera mise à jour. Pour toute question : <a href={`mailto:${COMPANY.privacyEmail}`}>{COMPANY.privacyEmail}</a>.
            </p>
          ),
        },
      ]}
    />
  );
}

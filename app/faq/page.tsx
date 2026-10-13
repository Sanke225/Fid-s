import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { LegalPage } from '@/components/legal/LegalPage';
import { COMPANY } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Questions fréquentes · Fid’s',
  description: 'Frais de 5 %, paiement du développeur, litiges, opérateurs acceptés, démo, compte : les réponses aux questions courantes sur Fid’s.',
};

type Qa = { q: string; a: ReactNode };

/** Liste de questions dépliables, accessibles au clavier sans JavaScript. */
function Questions({ items }: { items: Qa[] }) {
  return (
    <div className="divide-y divide-f-line rounded-3xl border border-f-line bg-f-card">
      {items.map(item => (
        <details key={item.q} className="group px-5 py-1">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-3 font-semibold [&::-webkit-details-marker]:hidden">
            {item.q}
            <span aria-hidden className="text-f-muted transition-transform group-open:rotate-45">+</span>
          </summary>
          <div className="pb-4 text-f-muted">{item.a}</div>
        </details>
      ))}
    </div>
  );
}

const GENERAL: Qa[] = [
  {
    q: 'Qu’est-ce que Fid’s ?',
    a: <p>Un tiers de confiance pour la livraison d’applications. Le développeur dépose son application, le client la teste sur une démo hébergée par Fid’s, puis il la reçoit à son nom une fois le paiement confirmé. Personne ne prend de risque : le client ne paie pas à l’aveugle, le développeur ne livre pas avant d’être payé.</p>,
  },
  {
    q: 'Le client peut-il copier ce qu’il voit sur la démo ?',
    a: <p>Non. La démo ne montre que l’application en fonctionnement, dans un conteneur isolé. Le code source, la base de données et les accès d’administration restent chiffrés jusqu’au paiement.</p>,
  },
  {
    q: 'Quels types d’applications sont acceptés ?',
    a: <p>Pour le moment, les applications Node.js et les sites statiques. D’autres technologies suivront.</p>,
  },
];

const PAIEMENT: Qa[] = [
  {
    q: 'Qui reçoit l’argent ?',
    a: <p>Le développeur reçoit 100 % du montant convenu, directement sur son numéro Mobile Money. Fid’s ne détient jamais cet argent : nous gardons l’application, pas l’argent.</p>,
  },
  {
    q: 'Pourquoi le client paie-t-il 5 % ?',
    a: <p>Ces frais de service financent ce qui protège le client : la démo hébergée, la vérification des paiements, la gestion des litiges et la remise de l’application à son nom. Le développeur ne paie rien, ce qui l’encourage à proposer Fid’s. Les frais sont de 5 % du montant, 100 FCFA minimum, payés seulement au moment de recevoir l’application.</p>,
  },
  {
    q: 'Combien coûte Fid’s pour un développeur ?',
    a: <p>Rien : 0 % de commission et aucun abonnement. Seuls les frais de l’opérateur Mobile Money, propres à chaque envoi, restent à la charge de celui qui envoie.</p>,
  },
  {
    q: 'Quels opérateurs sont acceptés ?',
    a: <p>Wave, Orange Money, Moov Money et MTN MoMo. Le développeur enregistre ses numéros, et le client choisit celui qui lui convient.</p>,
  },
  {
    q: 'Comment la livraison est-elle débloquée ?',
    a: (
      <ol className="list-decimal pl-5">
        <li>Le client paie le développeur et déclare la référence reçue par SMS.</li>
        <li>Le développeur confirme le dépôt.</li>
        <li>Le client paie les 5 % de frais à Fid’s et déclare la référence.</li>
        <li>Fid’s confirme les frais : l’application passe au nom du client.</li>
      </ol>
    ),
  },
  {
    q: 'Où trouver la référence de transaction ?',
    a: <p>Dans le SMS de confirmation envoyé par votre opérateur après le paiement, ou dans l’historique de votre application Mobile Money. Chaque référence ne peut être déclarée qu’une seule fois.</p>,
  },
  {
    q: 'Puis-je être remboursé ?',
    a: <p>Fid’s ne détient pas le paiement du développeur : son remboursement se règle directement entre le client et le développeur. Les frais de service payés par erreur, pour une livraison annulée avant la remise, sont remboursés sur demande. Voir les <Link href="/cf">Conditions financières</Link>.</p>,
  },
];

const LITIGES: Qa[] = [
  {
    q: 'Que se passe-t-il si le développeur ne confirme pas mon paiement ?',
    a: <p>Il a 48 heures pour le faire. Sans réponse, ou s’il refuse, vous ouvrez un litige depuis votre page de livraison avec vos preuves (SMS, référence). Le développeur a de nouveau 48 heures pour répondre, puis l’administration de Fid’s tranche. Voir le <Link href="/litiges">Règlement des litiges</Link>.</p>,
  },
  {
    q: 'Et si le client déclare un faux paiement ?',
    a: <p>Le développeur refuse la déclaration en indiquant qu’il n’a rien reçu. Une fausse référence est une fraude : elle entraîne la suspension du compte et peut être signalée aux autorités.</p>,
  },
  {
    q: 'Que se passe-t-il si le client ne paie pas ?',
    a: <p>La démo reste disponible 30 jours après le dernier dépôt du développeur. Sans paiement, elle est supprimée avec le code déposé : le développeur garde son travail, le client ne reçoit rien.</p>,
  },
];

const COMPTE: Qa[] = [
  {
    q: 'Le client doit-il créer un compte ?',
    a: <p>Non. Il peut tester et payer depuis le lien privé envoyé par le développeur. Un compte client permet en plus de retrouver toutes ses livraisons, factures et litiges. Le développeur peut aussi créer ce compte pour lui : le client choisit alors son mot de passe à la première connexion.</p>,
  },
  {
    q: 'Puis-je me connecter avec Google ou GitHub ?',
    a: <p>Oui, ou avec une adresse e-mail et un mot de passe. Vous choisissez ensuite votre type de compte : développeur ou client.</p>,
  },
  {
    q: 'Comment exporter mes données ?',
    a: <p>Depuis votre profil, « Exporter mes données » télécharge un fichier avec toutes les informations liées à votre compte.</p>,
  },
  {
    q: 'Comment supprimer mon compte ?',
    a: <p>Depuis votre profil, « Supprimer mon compte ». La suppression est possible dès qu’aucune livraison n’est en cours de paiement ou de remise et qu’aucun litige n’est ouvert. Vos données personnelles sont alors effacées ; les paiements et factures sont gardés sans votre nom, pour les obligations comptables. Voir la <Link href="/confidentialite">Politique de confidentialité</Link>.</p>,
  },
];

export default function FaqPage() {
  return (
    <LegalPage
      eyebrow="Aide"
      title="Questions fréquentes"
      numbered={false}
      sections={[
        { id: 'general', title: 'Fid’s en général', body: <Questions items={GENERAL} /> },
        { id: 'paiement', title: 'Paiement et frais', body: <Questions items={PAIEMENT} /> },
        { id: 'litiges', title: 'Problèmes et litiges', body: <Questions items={LITIGES} /> },
        { id: 'compte', title: 'Compte et données', body: <Questions items={COMPTE} /> },
      ]}
    >
      <div className="rounded-3xl border border-f-line bg-f-surface px-5 py-4 text-[15px]">
        Vous ne trouvez pas votre réponse ? Écrivez-nous à{' '}
        <a href={`mailto:${COMPANY.email}`} className="font-semibold underline">{COMPANY.email}</a> ou passez par la page <Link href="/contact" className="font-semibold underline">Contact</Link>.
      </div>
    </LegalPage>
  );
}

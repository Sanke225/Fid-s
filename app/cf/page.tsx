import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/legal/LegalPage';
import { PROVIDERS, PROVIDER_NAME, ProviderLogo } from '@/components/payments/ProviderLogo';

export const metadata: Metadata = {
  title: 'Conditions financières · Fid’s',
  description: 'Paiement direct au développeur, frais de service de 5 % payés par le client, remboursements et factures.',
};

export default function CfPage() {
  return (
    <LegalPage
      eyebrow="Paiements et livraison"
      title="Conditions financières"
      intro={
        <ul className="!list-none !pl-0 grid gap-4 rounded-3xl border border-f-line bg-f-card p-5 sm:grid-cols-2">
          {PROVIDERS.map(p => (
            <li key={p} className="!mt-0 flex items-center gap-3">
              <ProviderLogo provider={p} size={40} className="rounded-xl" />
              <span>
                <strong className="block text-[15px]">{PROVIDER_NAME[p]}</strong>
                <span className="text-[13px] text-f-muted">Paiement direct au développeur</span>
              </span>
            </li>
          ))}
        </ul>
      }
      sections={[
        {
          id: 'fonds',
          title: 'Fid’s ne détient jamais le paiement du développeur',
          body: (
            <>
              <p>
                Le client paie le développeur <strong>directement</strong>, sur l’un des numéros Mobile Money que le développeur a enregistrés. Fid’s n’est ni une banque, ni un établissement de paiement, ni un compte séquestre : <strong>le paiement destiné au développeur ne transite jamais par Fid’s</strong>.
              </p>
              <p>
                Seuls les frais de service (article 2), dus par le client, sont versés à Fid’s pour son propre compte. Ce que Fid’s garde jusqu’au règlement complet, c’est l’application : le code et les accès restent chiffrés et ne sont remis au client qu’à la fin du parcours décrit à l’article 3.
              </p>
            </>
          ),
        },
        {
          id: 'tarifs',
          title: 'Tarification : 0 % pour le développeur',
          body: (
            <>
              <p>
                Le développeur ne paie rien : il reçoit <strong>100 % du montant convenu</strong>. Le client règle à Fid’s des <strong>frais de service de 5 %</strong> du montant de la livraison (100 FCFA minimum, arrondis au franc supérieur), au moment de recevoir son application.
              </p>
              <table>
                <tbody>
                  <tr><td>Montant convenu (exemple)</td><td className="text-right font-semibold">500 000 FCFA</td></tr>
                  <tr><td>Reçu par le développeur</td><td className="text-right font-semibold">500 000 FCFA (100 %)</td></tr>
                  <tr><td>Frais de service Fid’s, payés par le client (5 %)</td><td className="text-right font-semibold">25 000 FCFA</td></tr>
                  <tr><td className="text-f-muted">Total payé par le client, en deux paiements</td><td className="text-right text-f-muted">525 000 FCFA</td></tr>
                </tbody>
              </table>
              <p>Aucun abonnement. Les frais propres à chaque opérateur Mobile Money (envoi, retrait) restent régis par les conditions de l’opérateur.</p>
            </>
          ),
        },
        {
          id: 'parcours',
          title: 'Paiement et déblocage de la livraison',
          body: (
            <>
              <ol>
                <li>Le client teste l’application sur la démo, accessible par son lien de livraison ou son espace client.</li>
                <li>S’il est satisfait, il paie le montant convenu au numéro Mobile Money du développeur de son choix, puis <strong>déclare son paiement</strong> avec la référence reçue par SMS.</li>
                <li>Le développeur vérifie la réception et clique sur <strong>« Dépôt confirmé »</strong>, dans un délai de 48 heures. La démo reste consultable, mais rien n’est encore remis.</li>
                <li>Le client règle les <strong>frais de service de 5 %</strong> sur l’un des numéros de Fid’s indiqués sur sa page, puis déclare la référence. Fid’s la vérifie sous 48 heures.</li>
                <li>Dès que Fid’s a confirmé la réception des frais, la livraison est débloquée : l’application passe au nom du client, avec ses accès et, si prévu, le code source.</li>
              </ol>
              <p>
                Les montants qui font foi sont ceux affichés par Fid’s sur la page de livraison. Seules les confirmations du développeur et de Fid’s, ou une décision de l’administration (article 5), débloquent la livraison.
              </p>
            </>
          ),
        },
        {
          id: 'demo',
          title: 'Essai et expiration de la démo',
          body: (
            <>
              <p>La démo reste accessible jusqu’à la date d’expiration indiquée sur la page de livraison, soit 30 jours après le dernier dépôt du développeur. Le client n’a rien à payer tant qu’il n’a pas décidé de garder l’application.</p>
              <p>Sans paiement confirmé à l’expiration, la démo et le code déposé sont supprimés : le développeur conserve son travail et le client ne reçoit rien.</p>
            </>
          ),
        },
        {
          id: 'contestation',
          title: 'Paiement contesté',
          body: (
            <>
              <p>
                Si le développeur indique n’avoir rien reçu, ou ne traite pas un paiement déclaré, le client peut ouvrir un ticket avec ses preuves. Le développeur dispose d’un délai pour répondre, puis l’administration tranche sur preuves. La procédure complète est décrite dans le <Link href="/litiges">Règlement des litiges</Link>.
              </p>
              <p>
                Si Fid’s ne constate pas la réception de ses frais de service, la déclaration est refusée avec un motif et le client peut déclarer à nouveau. L’administration ne manipule jamais le paiement destiné au développeur : elle ne peut ni l’encaisser, ni le reverser, ni le rembourser.
              </p>
            </>
          ),
        },
        {
          id: 'remboursements',
          title: 'Remboursements',
          body: (
            <p>
              Fid’s ne détenant pas le paiement destiné au développeur, elle ne peut pas le rembourser : toute restitution de cette somme se règle directement entre le client et le développeur. Les frais de service ne sont exigibles qu’au moment où l’application est remise au client ; s’ils ont été payés par erreur (livraison annulée avant la passation), ils sont remboursés sur demande au <Link href="/contact">support</Link>.
            </p>
          ),
        },
        {
          id: 'factures',
          title: 'Factures',
          body: (
            <p>
              À la passation, Fid’s émet une facture numérotée au nom du développeur (vendeur) et du client (acheteur) pour le montant de la livraison, ainsi qu’un reçu pour les frais de service. Les deux documents sont disponibles dans l’espace client, la facture également dans l’espace développeur. Ils sont conservés dix ans, conformément aux obligations comptables.
            </p>
          ),
        },
      ]}
    />
  );
}

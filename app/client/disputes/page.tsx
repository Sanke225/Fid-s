'use client';

import Link from 'next/link';
import { Card, DevPage, ErrorState, PageHeader, Skeleton } from '@/components/dev/ui';
import { errorMessage } from '@/lib/api/client';
import type { ClientTicket } from '@/lib/contracts';
import { TONE_CLASS, formatXof, timeAgo, type Tone } from '@/lib/delivery-ui';
import { useClientTickets } from '@/lib/queries/client';

const UI: Record<ClientTicket['status'], { label: string; tone: Tone; text: (t: ClientTicket) => string }> = {
  awaiting_dev: {
    label: 'En attente du développeur',
    tone: 'warning',
    text: t => `${t.devName} doit répondre${t.devDueAt ? ` avant le ${new Date(t.devDueAt).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}` : ''}. Sans réponse, l’équipe Fid’s tranchera sur vos preuves.`,
  },
  open: { label: 'En arbitrage Fid’s', tone: 'info', text: () => 'L’équipe Fid’s examine les preuves et va trancher.' },
  resolved_released: { label: 'Paiement reconnu', tone: 'success', text: () => 'Votre paiement a été reconnu : la livraison continue.' },
  resolved_rejected: { label: 'Paiement non reconnu', tone: 'neutral', text: () => 'Après examen, le paiement n’a pas pu être reconnu.' },
};

/** Litiges du client : où en est chaque contestation de paiement. */
export default function ClientDisputesPage() {
  const { data: tickets, isPending, error, refetch } = useClientTickets();
  return (
    <DevPage>
      <PageHeader eyebrow="Règlements" title="Litiges" />
      <Card className="mb-6 p-5 text-[14.5px] text-f-muted">
        Si un développeur indique n’avoir rien reçu, ou ne confirme pas votre paiement sous 48 h, ouvrez un litige depuis la page de la livraison. Le développeur a 48 h pour répondre ; sinon, l’équipe Fid’s tranche sur vos preuves.
      </Card>
      {isPending ? (
        <Skeleton className="h-48" />
      ) : error ? (
        <ErrorState message={errorMessage(error)} onRetry={() => refetch()} />
      ) : tickets.length === 0 ? (
        <Card className="px-6 py-14 text-center">
          <p className="font-display text-[22px]">Aucun litige</p>
          <p className="mx-auto mt-2 max-w-md text-[15px] text-f-muted">Vos contestations de paiement apparaîtront ici.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map(t => {
            const ui = UI[t.status];
            return (
              <Card key={t.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link href={`/client/deliveries/${t.deliveryId}`} className="text-[16px] font-bold hover:text-f-ink-accent">
                      {t.projectName}
                    </Link>
                    <p className="text-[13px] text-f-muted">
                      {t.devName} · {formatXof(t.amountXof)} · ouvert {timeAgo(t.createdAt)}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${TONE_CLASS[ui.tone]}`}>{ui.label}</span>
                </div>
                <p className="mt-3 text-[14px] text-f-muted">{ui.text(t)}</p>
                <p className="mt-3 rounded-2xl bg-f-surface px-4 py-3 text-[14px]">
                  <span className="block text-[11.5px] font-semibold uppercase tracking-[.08em] text-f-muted">Votre demande</span>
                  {t.clientClaim}
                </p>
                {t.devAnswer ? (
                  <p className="mt-2 rounded-2xl bg-f-surface px-4 py-3 text-[14px]">
                    <span className="block text-[11.5px] font-semibold uppercase tracking-[.08em] text-f-muted">Réponse de {t.devName}</span>
                    {t.devAnswer}
                  </p>
                ) : null}
                {t.resolution ? <p className="mt-2 text-[14px]"><strong>Décision :</strong> {t.resolution}</p> : null}
              </Card>
            );
          })}
        </div>
      )}
    </DevPage>
  );
}

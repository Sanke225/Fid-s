'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { ChevronRightIcon } from '@/components/Icons';
import { Card, DevPage, ErrorState, PageHeader, Skeleton } from '@/components/dev/ui';
import { errorMessage } from '@/lib/api/client';
import { TICKET_UI, TONE_CLASS, formatXof, timeAgo } from '@/lib/delivery-ui';
import { useProjects } from '@/lib/queries/projects';
import { useDevTickets } from '@/lib/queries/tickets';

/** Litiges ouverts par les clients du dev : à traiter en priorité (48 h pour répondre). */
export default function DevDisputesPage() {
  const { data: tickets, isPending, error, refetch } = useDevTickets();
  const { data: projects } = useProjects();
  const byDelivery = useMemo(() => {
    const m = new Map<string, { projectId: string; projectName: string; clientName: string; amount: number }>();
    for (const p of projects ?? []) for (const d of p.deliveries) m.set(d.id, { projectId: p.id, projectName: p.name, clientName: d.client.name, amount: d.amountXof });
    return m;
  }, [projects]);
  const sorted = [...(tickets ?? [])].sort((a, b) => Number(b.status === 'awaiting_dev') - Number(a.status === 'awaiting_dev'));

  return (
    <DevPage>
      <PageHeader eyebrow="Relation client" title="Litiges" />
      <Card className="mb-6 p-5 text-[14.5px] text-f-muted">
        Un client ouvre un litige quand vous indiquez « rien reçu » ou ne confirmez pas son paiement sous 48 h. Vous avez ensuite <strong className="text-f-text">48 heures pour répondre</strong> ; sans réponse, l’équipe Fid’s tranche sur les preuves du client.
      </Card>
      {isPending ? (
        <Skeleton className="h-48" />
      ) : error ? (
        <ErrorState message={errorMessage(error)} onRetry={() => refetch()} />
      ) : sorted.length === 0 ? (
        <Card className="px-6 py-14 text-center">
          <p className="font-display text-[22px]">Aucun litige</p>
          <p className="mx-auto mt-2 max-w-md text-[15px] text-f-muted">Tant que vous confirmez les paiements reçus, il n’y en aura pas.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-[var(--color-divider)]">
            {sorted.map(t => {
              const info = byDelivery.get(t.deliveryId);
              const ui = TICKET_UI[t.status];
              return (
                <li key={t.id}>
                  <Link href={info ? `/dev/project/${info.projectId}` : '/dev/projects'} className="flex flex-wrap items-center gap-4 px-5 py-4 hover:bg-f-surface">
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-semibold">
                        {info?.projectName ?? 'Livraison'} {info ? <span className="font-normal text-f-muted">· {info.clientName} · {formatXof(info.amount)}</span> : null}
                      </span>
                      <span className="block truncate text-[13.5px] text-f-muted">« {t.clientClaim} »</span>
                      <span className="block text-[12.5px] text-f-muted">
                        Ouvert {timeAgo(t.createdAt)}
                        {t.status === 'awaiting_dev' && t.devDueAt ? ` · répondre avant le ${new Date(t.devDueAt).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}` : ''}
                      </span>
                    </span>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] font-semibold ${TONE_CLASS[ui.tone]}`}>{ui.label}</span>
                    <ChevronRightIcon size={15} className="shrink-0 text-f-muted" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </DevPage>
  );
}

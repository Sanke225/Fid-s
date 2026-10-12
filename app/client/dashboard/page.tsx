'use client';

import Link from 'next/link';
import { useMemo, type ReactNode } from 'react';
import { ChevronRightIcon, PlusIcon } from '@/components/Icons';
import { ClientBadge } from '@/components/client/ui';
import { Card, DevPage, ErrorState, PageHeader, Skeleton } from '@/components/dev/ui';
import { errorMessage } from '@/lib/api/client';
import type { ClientDelivery } from '@/lib/contracts';
import { clientAction } from '@/lib/client-ui';
import { formatXof, timeAgo } from '@/lib/delivery-ui';
import { useClientDeliveries } from '@/lib/queries/client';
import { useMe } from '@/lib/queries/me';

/** Chiffres du client : ce qu'il doit, ce qu'il a réglé, ce qu'il a reçu. */
function computeStats(deliveries: ClientDelivery[]) {
  const settled = deliveries.filter(d => ['paid', 'handing_over', 'delivered'].includes(d.status));
  return {
    toPay: deliveries.filter(d => d.status === 'demo_ready' && !d.paymentPending && !d.ticketOpen).reduce((s, d) => s + d.amountXof, 0),
    feesDue: deliveries.filter(d => d.status === 'awaiting_fee' && d.fee.status === 'due').reduce((s, d) => s + d.fee.amountXof, 0),
    paid: settled.reduce((s, d) => s + d.amountXof + d.fee.amountXof, 0) + deliveries.filter(d => d.status === 'awaiting_fee').reduce((s, d) => s + d.amountXof, 0),
    delivered: deliveries.filter(d => d.status === 'delivered').length,
    todo: deliveries.map(d => ({ d, action: clientAction(d) })).filter((x): x is { d: ClientDelivery; action: NonNullable<ReturnType<typeof clientAction>> } => x.action !== null),
  };
}

export default function ClientDashboardPage() {
  const { data: me } = useMe();
  const { data: deliveries, isPending, error, refetch } = useClientDeliveries();
  const stats = useMemo(() => (deliveries ? computeStats(deliveries) : null), [deliveries]);
  const firstName = (me?.name ?? '').split(' ')[0];

  return (
    <DevPage>
      <PageHeader eyebrow="Espace client" title={firstName ? `Bonjour, ${firstName}` : 'Tableau de bord'} />

      {me && !me.email ? (
        <Link href="/client/profile" className="mb-5 flex items-center gap-3 rounded-[20px] border border-[var(--warning)] bg-[var(--warning-100)] px-5 py-4 text-[14.5px] text-[var(--warning-800)]">
          <span className="min-w-0 flex-1">
            <strong className="block">Ajoutez votre adresse e-mail</strong>
            Pour recevoir vos factures et pouvoir récupérer votre compte.
          </span>
          <ChevronRightIcon size={16} className="shrink-0" />
        </Link>
      ) : null}

      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={errorMessage(error)} onRetry={() => refetch()} />
      ) : deliveries.length === 0 || !stats ? (
        <Card className="px-6 py-14 text-center">
          <p className="font-display text-[24px]">Aucune livraison pour l’instant</p>
          <p className="mx-auto mt-2 max-w-md text-[15px] text-f-muted">
            Votre développeur vous envoie un lien de livraison. Ajoutez-le ici pour suivre au même endroit la démo, vos paiements et vos factures.
          </p>
          <Link href="/client/ajouter" className="cta-primary mt-6 rounded-full px-6 py-3 text-[15px]">
            <PlusIcon size={17} /> Ajouter une livraison
          </Link>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="À payer aux développeurs" value={formatXof(stats.toPay)} sub="Démos en ligne à tester" highlight={stats.toPay > 0} />
            <Stat label="Frais Fid’s à régler" value={formatXof(stats.feesDue)} sub={stats.feesDue ? 'Pour recevoir vos applications' : 'Rien à régler'} highlight={stats.feesDue > 0} />
            <Stat label="Total réglé" value={formatXof(stats.paid)} sub="Paiements et frais confirmés" />
            <Stat label="Applications reçues" value={String(stats.delivered)} sub="Livrées à votre nom" />
          </div>

          <div className="mt-5 grid items-start gap-5 lg:grid-cols-[1fr_1.3fr]">
            <Card className="p-6">
              <h2 className="heading-sans text-[16px]">À faire</h2>
              {stats.todo.length === 0 ? (
                <p className="mt-4 text-[14.5px] text-f-muted">Rien en attente de votre part.</p>
              ) : (
                <ul className="mt-3 divide-y divide-[var(--color-divider)]">
                  {stats.todo.slice(0, 6).map(({ d, action }) => (
                    <li key={d.id}>
                      <Link href={`/client/deliveries/${d.id}`} className="flex items-center gap-3 py-3 hover:text-f-ink-accent">
                        <span aria-hidden className={`size-2 shrink-0 rounded-full ${action.urgent ? 'bg-[var(--warning)]' : 'bg-f-line'}`} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[14.5px] font-semibold">{d.projectName}</span>
                          <span className="block text-[13px] text-f-muted">{action.text}</span>
                        </span>
                        <ChevronRightIcon size={15} className="shrink-0 text-f-muted" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="heading-sans text-[16px]">Livraisons récentes</h2>
                <Link href="/client/deliveries" className="text-[14px] font-semibold text-f-ink-accent hover:underline">
                  Tout voir ({deliveries.length})
                </Link>
              </div>
              <ul className="mt-3 divide-y divide-[var(--color-divider)]">
                {deliveries.slice(0, 5).map(d => (
                  <li key={d.id}>
                    <Link href={`/client/deliveries/${d.id}`} className="flex flex-wrap items-center gap-3 py-3.5">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[15px] font-semibold">{d.projectName}</span>
                        <span className="block text-[13px] text-f-muted">
                          par {d.devName} · {timeAgo(d.updatedAt)}
                        </span>
                      </span>
                      <ClientBadge delivery={d} />
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </>
      )}
    </DevPage>
  );
}

function Stat({ label, value, sub, highlight }: { label: string; value: ReactNode; sub: string; highlight?: boolean }) {
  return (
    <Card className={`p-5 ${highlight ? 'border-[var(--warning)] bg-[var(--warning-100)]' : ''}`}>
      <p className="text-[13.5px] text-f-muted">{label}</p>
      <p className="mt-2 font-display text-[clamp(1.4rem,2.2vw,1.8rem)] leading-none">{value}</p>
      <p className={`mt-2 text-[12.5px] ${highlight ? 'font-semibold text-[var(--warning-800)]' : 'text-f-muted'}`}>{sub}</p>
    </Card>
  );
}

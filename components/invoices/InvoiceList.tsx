'use client';

import { Card, DevPage, ErrorState, PageHeader, Skeleton } from '@/components/dev/ui';
import { InvoiceIcon } from '@/components/Icons';
import { errorMessage } from '@/lib/api/client';
import type { InvoiceSummary } from '@/lib/contracts';
import { formatDate, formatXof } from '@/lib/delivery-ui';

/**
 * Liste de factures, commune au dev (émises) et au client (reçues). Une facture est émise à la passation ;
 * le téléchargement PDF arrivera avec elle.
 */
export function InvoiceList({
  side,
  data,
  isPending,
  error,
  onRetry,
}: {
  side: 'dev' | 'client';
  data: InvoiceSummary[] | undefined;
  isPending: boolean;
  error: unknown;
  onRetry: () => void;
}) {
  return (
    <DevPage>
      <PageHeader eyebrow={side === 'dev' ? 'Encaissement' : 'Règlements'} title="Factures" />
      {isPending ? (
        <Skeleton className="h-48" />
      ) : error ? (
        <ErrorState message={errorMessage(error)} onRetry={onRetry} />
      ) : !data || data.length === 0 ? (
        <Card className="px-6 py-14 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-f-surface text-f-ink-accent">
            <InvoiceIcon size={22} />
          </span>
          <p className="mt-4 font-display text-[22px]">Aucune facture pour l’instant</p>
          <p className="mx-auto mt-2 max-w-md text-[15px] text-f-muted">
            {side === 'dev'
              ? 'Une facture numérotée est émise automatiquement à votre nom à chaque application remise à un client.'
              : 'Vous recevez une facture numérotée à chaque application remise à votre nom.'}
          </p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-[var(--color-divider)]">
            {data.map(i => (
              <li key={i.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-f-surface text-f-ink-accent">
                  <InvoiceIcon size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[14.5px] font-semibold">{i.number}</p>
                  <p className="text-[13px] text-f-muted">
                    {i.projectName} · {side === 'dev' ? 'client' : 'développeur'} : {i.counterpart} · {formatDate(i.issuedAt)}
                  </p>
                </div>
                <p className="text-[16px] font-bold tabular-nums">{formatXof(i.amountXof)}</p>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </DevPage>
  );
}

'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Card, DevPage, ErrorState, PageHeader, Skeleton } from '@/components/dev/ui';
import { PROVIDER_NAME, ProviderLogo } from '@/components/payments/ProviderLogo';
import { errorMessage } from '@/lib/api/client';
import { PAYMENT_STATUS_UI } from '@/lib/client-ui';
import { TONE_CLASS, formatXof } from '@/lib/delivery-ui';
import { formatPhone } from '@/lib/phone';
import { useClientPayments } from '@/lib/queries/client';

const FILTERS = [
  { id: 'all', label: 'Tous' },
  { id: 'dev', label: 'Aux développeurs' },
  { id: 'fee', label: 'Frais Fid’s' },
] as const;

/** Historique des règlements du client : ce qu'il a envoyé, à qui, et où c'en est. */
export default function ClientPaymentsPage() {
  const { data: payments, isPending, error, refetch } = useClientPayments();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['id']>('all');

  const visible = useMemo(() => (payments ?? []).filter(p => filter === 'all' || p.kind === filter), [payments, filter]);
  const confirmedTotal = useMemo(() => (payments ?? []).filter(p => p.status === 'confirmed').reduce((s, p) => s + p.amountXof, 0), [payments]);

  return (
    <DevPage>
      <PageHeader eyebrow="Règlements" title="Paiements" />

      <Card className="mb-6 flex flex-wrap items-center justify-between gap-4 p-5">
        <p className="min-w-0 flex-1 text-[14.5px] text-f-muted">
          Vous payez chaque développeur <strong className="text-f-text">directement</strong> sur son numéro Mobile Money, puis les frais de service Fid’s (5 %) à la remise de l’application.
        </p>
        <div className="text-right">
          <p className="text-[12.5px] text-f-muted">Total confirmé</p>
          <p className="font-display text-[22px] leading-none">{formatXof(confirmedTotal)}</p>
        </div>
      </Card>

      {payments && payments.length > 0 ? (
        <div role="group" aria-label="Filtrer" className="mb-4 flex flex-wrap gap-2">
          {FILTERS.map(f => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-full border px-3.5 py-2 text-[13.5px] font-semibold transition-colors ${
                filter === f.id ? 'border-transparent bg-[#C84A00] text-white' : 'border-f-line bg-f-card hover:bg-f-surface'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      ) : null}

      {isPending ? (
        <Skeleton className="h-64" />
      ) : error ? (
        <ErrorState message={errorMessage(error)} onRetry={() => refetch()} />
      ) : payments.length === 0 ? (
        <Card className="px-6 py-14 text-center">
          <p className="font-display text-[22px]">Aucun paiement</p>
          <p className="mx-auto mt-2 max-w-md text-[15px] text-f-muted">Vos paiements apparaîtront ici dès que vous en déclarerez un depuis une livraison.</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-[var(--color-divider)]">
            {visible.map(p => {
              const st = PAYMENT_STATUS_UI[p.status];
              return (
                <li key={p.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                  <ProviderLogo provider={p.provider} size={40} className="shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-semibold">
                      {p.kind === 'fee' ? 'Frais de service Fid’s' : `Paiement à ${p.payee}`}
                      <Link href={`/client/deliveries/${p.deliveryId}`} className="ml-2 text-[13px] font-normal text-f-ink-accent hover:underline">
                        {p.projectName}
                      </Link>
                    </p>
                    <p className="text-[13px] text-f-muted">
                      {PROVIDER_NAME[p.provider]} {formatPhone(p.payeePhone)} · réf. <span className="font-mono">{p.transactionRef}</span> ·{' '}
                      {new Date(p.declaredAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    {p.rejectionReason ? <p className="mt-1 text-[13px] text-[var(--danger-800)]">Motif : {p.rejectionReason}</p> : null}
                  </div>
                  <div className="text-right">
                    <p className="text-[16px] font-bold tabular-nums">{formatXof(p.amountXof)}</p>
                    <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${TONE_CLASS[st.tone]}`}>{st.label}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </DevPage>
  );
}

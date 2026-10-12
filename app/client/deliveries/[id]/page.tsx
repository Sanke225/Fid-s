'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import type { ReactNode } from 'react';
import { ArrowLeftIcon, CheckIcon, ExternalIcon } from '@/components/Icons';
import { ClientBadge, totalFor } from '@/components/client/ui';
import { Card, DevPage, ErrorState, PageHeader, Skeleton } from '@/components/dev/ui';
import { PROVIDER_NAME, ProviderLogo } from '@/components/payments/ProviderLogo';
import { errorMessage } from '@/lib/api/client';
import type { ClientDelivery, ClientPayment } from '@/lib/contracts';
import { CLIENT_STATUS_UI, PAYMENT_STATUS_UI } from '@/lib/client-ui';
import { TONE_CLASS, formatDate, formatXof, timeAgo } from '@/lib/delivery-ui';
import { useClientDeliveries, useClientPayments } from '@/lib/queries/client';

/** Étapes vues par le client, de l'essai à la remise. */
function stepsFor(d: ClientDelivery) {
  const order = ['demo_ready', 'awaiting_fee', 'paid', 'handing_over', 'delivered'];
  const at = order.indexOf(d.status);
  const done = (i: number) => at > i || d.status === 'delivered';
  return [
    { label: 'Tester la démo', done: done(0) || at >= 1, active: at === 0 && !d.paymentPending },
    { label: `Payer ${d.devName}`, done: done(0), active: at === 0 && d.paymentPending },
    { label: 'Régler les frais Fid’s (5 %)', done: done(1), active: at === 1 },
    { label: 'Installation à votre nom', done: done(3), active: at === 2 || at === 3 },
    { label: 'Application reçue', done: d.status === 'delivered', active: false },
  ];
}

export default function ClientDeliveryPage() {
  const { id } = useParams<{ id: string }>();
  const { data: deliveries, isPending, error, refetch } = useClientDeliveries();
  const { data: payments } = useClientPayments();
  const d = deliveries?.find(x => x.id === id);

  if (isPending) {
    return (
      <DevPage>
        <Skeleton className="mb-8 h-16 w-2/3" />
        <Skeleton className="h-72" />
      </DevPage>
    );
  }
  if (error || !d) {
    return (
      <DevPage>
        <BackLink />
        <ErrorState message={error ? errorMessage(error) : 'Cette livraison n’est pas dans votre espace.'} onRetry={error ? () => refetch() : undefined} />
      </DevPage>
    );
  }

  const ui = CLIENT_STATUS_UI[d.status];
  const mine = (payments ?? []).filter(p => p.deliveryId === d.id);
  const steps = stepsFor(d);

  return (
    <DevPage>
      <BackLink />
      <PageHeader
        eyebrow={`Livraison de ${d.devName}`}
        title={d.projectName}
        actions={
          d.demoUrl ? (
            <Link href={`/apercu/${d.id}`} className="cta-primary rounded-full px-5 py-3 text-[14.5px]">
              Voir l’application
            </Link>
          ) : null
        }
      />

      <div className="grid items-start gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <ClientBadge delivery={d} />
              <span className="text-[13px] text-f-muted">Mise à jour {timeAgo(d.updatedAt)}</span>
            </div>
            <p className="mt-3 text-[15px] text-f-muted">{d.paymentPending ? `${d.devName} vérifie la réception de votre paiement. Cette page se met à jour toute seule.` : ui.hint}</p>
            <PrimaryAction d={d} />
          </Card>

          {d.status !== 'unavailable' ? (
            <Card className="p-6">
              <h2 className="heading-sans text-[16px]">Suivi</h2>
              <ol className="mt-4 space-y-3">
                {steps.map(s => (
                  <li key={s.label} className="flex items-center gap-3 text-[14.5px]">
                    <span
                      className={`grid size-7 shrink-0 place-items-center rounded-full ${
                        s.done ? 'bg-[#C84A00] text-white' : s.active ? 'border-2 border-[var(--color-accent)] text-f-ink-accent' : 'border-2 border-f-line'
                      }`}
                    >
                      {s.done ? <CheckIcon size={14} /> : s.active ? <span className="size-2 animate-pulse rounded-full bg-[var(--color-accent)]" /> : null}
                    </span>
                    <span className={s.done || s.active ? 'font-semibold' : 'text-f-muted'}>{s.label}</span>
                  </li>
                ))}
              </ol>
            </Card>
          ) : null}

          <Card className="p-6">
            <h2 className="heading-sans text-[16px]">Vos règlements</h2>
            {mine.length === 0 ? (
              <p className="mt-3 text-[14.5px] text-f-muted">Aucun règlement déclaré pour cette livraison.</p>
            ) : (
              <ul className="mt-3 divide-y divide-[var(--color-divider)]">
                {mine.map(p => (
                  <PaymentLine key={p.id} p={p} />
                ))}
              </ul>
            )}
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="heading-sans text-[16px]">Montants</h2>
          <dl className="mt-4 divide-y divide-[var(--color-divider)] text-[14.5px]">
            <Row label={`Payé directement à ${d.devName}`} value={formatXof(d.amountXof)} />
            <Row label="Frais de service Fid’s (5 %)" value={formatXof(d.fee.amountXof)} />
            <Row label="Total" value={<strong className="text-f-ink-accent">{formatXof(totalFor(d))}</strong>} />
            {d.expiresAt && d.status === 'demo_ready' ? <Row label="Démo disponible jusqu’au" value={formatDate(d.expiresAt)} /> : null}
            {d.paidAt ? <Row label="Payée le" value={formatDate(d.paidAt)} /> : null}
            {d.deliveredAt ? <Row label="Reçue le" value={formatDate(d.deliveredAt)} /> : null}
          </dl>
          <p className="mt-4 text-[12.5px] text-f-muted">Fid’s ne détient jamais le paiement destiné au développeur : il va directement sur son numéro.</p>
        </Card>
      </div>
    </DevPage>
  );
}

/** Une seule action principale, selon le moment. Le paiement se fait sur le lien de livraison. */
function PrimaryAction({ d }: { d: ClientDelivery }) {
  const link = (href: string, label: string, primary = true) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className={`${primary ? 'cta-primary' : 'cta-ghost'} mt-5 rounded-full px-6 py-3 text-[15px]`}>
      {label} <ExternalIcon size={15} />
    </a>
  );
  if (d.status === 'delivered' && d.clientUrl) return link(d.clientUrl, 'Ouvrir mon application');
  if (d.status === 'awaiting_fee' && d.fee.status === 'due') return link(d.publicUrl, `Régler les frais (${formatXof(d.fee.amountXof)})`);
  if (d.status === 'demo_ready' && !d.paymentPending && !d.ticketOpen) return link(d.publicUrl, 'Tester la démo et payer');
  if (d.status !== 'unavailable') return link(d.publicUrl, 'Ouvrir la page de livraison', false);
  return null;
}

function PaymentLine({ p }: { p: ClientPayment }) {
  const st = PAYMENT_STATUS_UI[p.status];
  return (
    <li className="flex items-center gap-3 py-3">
      <ProviderLogo provider={p.provider} size={36} className="shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 text-[14px]">
        <p className="font-semibold">
          {formatXof(p.amountXof)} · {p.kind === 'fee' ? 'Frais Fid’s' : `à ${p.payee}`}
        </p>
        <p className="truncate text-[12.5px] text-f-muted">
          {PROVIDER_NAME[p.provider]} · réf. <span className="font-mono">{p.transactionRef}</span> · {timeAgo(p.declaredAt)}
        </p>
      </div>
      <span className={`shrink-0 rounded-full px-2.5 py-1 text-[12px] font-semibold ${TONE_CLASS[st.tone]}`}>{st.label}</span>
    </li>
  );
}

function BackLink() {
  return (
    <Link href="/client/deliveries" className="mb-6 inline-flex items-center gap-1.5 text-[14px] font-semibold text-f-muted hover:text-f-text">
      <ArrowLeftIcon size={15} /> Retour à mes livraisons
    </Link>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="text-f-muted">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}

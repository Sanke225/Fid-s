'use client';

import { useState, type FormEvent } from 'react';
import { FormAlert } from '@/components/auth/Field';
import { SpinnerIcon } from '@/components/auth/AuthIcons';
import { Card, DevPage, ErrorState, PageHeader, Skeleton } from '@/components/dev/ui';
import { PROVIDER_NAME, ProviderLogo } from '@/components/payments/ProviderLogo';
import { useToast } from '@/components/Toast';
import { errorMessage } from '@/lib/api/client';
import type { TicketStatus } from '@/lib/contracts';
import { TONE_CLASS, formatXof, timeAgo } from '@/lib/delivery-ui';
import { formatPhone } from '@/lib/phone';
import { useAdminTicket, useAdminTickets, useResolveTicket } from '@/lib/queries/admin';

const TABS: { id: TicketStatus; label: string }[] = [
  { id: 'open', label: 'À trancher' },
  { id: 'awaiting_dev', label: 'En attente du dev' },
  { id: 'resolved_released', label: 'Paiement reconnu' },
  { id: 'resolved_rejected', label: 'Paiement refusé' },
];

/** Litiges : l'admin tranche sur preuves. Libérer = reconnaître le paiement (jamais toucher l'argent). */
export default function AdminDisputesPage() {
  const [tab, setTab] = useState<TicketStatus>('open');
  const { data: tickets, isPending, error, refetch } = useAdminTickets(tab);
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <DevPage>
      <PageHeader eyebrow="À traiter" title="Litiges à trancher" />
      <div role="group" aria-label="Filtrer" className="mb-4 flex flex-wrap gap-2">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            aria-pressed={tab === t.id}
            onClick={() => {
              setTab(t.id);
              setSelected(null);
            }}
            className={`rounded-full border px-3.5 py-2 text-[13.5px] font-semibold transition-colors ${tab === t.id ? 'border-transparent bg-[#C84A00] text-white' : 'border-f-line bg-f-card hover:bg-f-surface'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="grid items-start gap-5 lg:grid-cols-[1fr_1.4fr]">
        <div>
          {isPending ? (
            <Skeleton className="h-48" />
          ) : error ? (
            <ErrorState message={errorMessage(error)} onRetry={() => refetch()} />
          ) : tickets.length === 0 ? (
            <Card className="px-6 py-12 text-center text-[15px] text-f-muted">Aucun litige dans cette catégorie.</Card>
          ) : (
            <Card className="overflow-hidden">
              <ul className="divide-y divide-[var(--color-divider)]">
                {tickets.map(t => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(t.id)}
                      aria-pressed={selected === t.id}
                      className={`block w-full px-5 py-4 text-left hover:bg-f-surface ${selected === t.id ? 'bg-[var(--color-accent-100)]' : ''}`}
                    >
                      <span className="block truncate text-[14.5px] font-semibold">« {t.clientClaim} »</span>
                      <span className="block text-[12.5px] text-f-muted">Ouvert {timeAgo(t.createdAt)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
        {selected ? <TicketDetail id={selected} /> : <Card className="px-6 py-12 text-center text-[14.5px] text-f-muted">Sélectionnez un litige pour voir les preuves.</Card>}
      </div>
    </DevPage>
  );
}

function TicketDetail({ id }: { id: string }) {
  const { data, isPending, error } = useAdminTicket(id);
  const resolve = useResolveTicket();
  const { showToast } = useToast();
  const [resolution, setResolution] = useState('');
  const [fieldErr, setFieldErr] = useState<string | null>(null);

  if (isPending) return <Skeleton className="h-80" />;
  if (error) return <Card className="p-6 text-[var(--danger-800)]">{errorMessage(error)}</Card>;
  const { ticket, payment, delivery } = data;
  const decidable = ticket.status === 'open' || ticket.status === 'awaiting_dev';

  const decide = (decision: 'release' | 'reject') => (e: FormEvent) => {
    e.preventDefault();
    if (resolution.trim().length < 10) {
      setFieldErr('Motivez la décision (10 caractères minimum) : elle est journalisée et montrée aux deux parties.');
      return;
    }
    resolve.mutate(
      { id, decision, resolution: resolution.trim() },
      { onSuccess: () => showToast(decision === 'release' ? 'Paiement reconnu : livraison débloquée' : 'Paiement refusé', 'success') },
    );
  };

  return (
    <Card className="p-6">
      <p className="text-[13px] text-f-muted">{delivery.projectName}</p>
      <h2 className="heading-sans text-[18px]">
        {delivery.clientName} conteste un paiement à {delivery.dev.name}
      </h2>
      <div className="mt-4 flex items-center gap-3 rounded-2xl bg-f-surface p-3">
        <ProviderLogo provider={payment.provider} size={40} className="shrink-0 rounded-xl" />
        <p className="text-[13.5px]">
          <strong>{formatXof(payment.amountXof)}</strong> vers {PROVIDER_NAME[payment.provider]} {formatPhone(payment.payeePhone)} · réf. <span className="font-mono">{payment.transactionRef}</span>
          <span className="block text-f-muted">
            Payé par {payment.payerName} ({formatPhone(payment.payerPhone)}) · déclaré {timeAgo(payment.declaredAt)}
          </span>
        </p>
      </div>
      <dl className="mt-4 space-y-3 text-[14px]">
        <div className="rounded-2xl bg-f-surface px-4 py-3">
          <dt className="text-[11.5px] font-semibold uppercase tracking-[.08em] text-f-muted">Le client</dt>
          <dd>{ticket.clientClaim}</dd>
        </div>
        <div className="rounded-2xl bg-f-surface px-4 py-3">
          <dt className="text-[11.5px] font-semibold uppercase tracking-[.08em] text-f-muted">Le développeur ({delivery.dev.email})</dt>
          <dd>{ticket.devAnswer ?? (payment.rejectionReason ? `« Rien reçu » : ${payment.rejectionReason}` : 'Pas encore de réponse.')}</dd>
        </div>
        {ticket.resolution ? (
          <div className="rounded-2xl border border-f-line px-4 py-3">
            <dt className="text-[11.5px] font-semibold uppercase tracking-[.08em] text-f-muted">Décision</dt>
            <dd>{ticket.resolution}</dd>
          </div>
        ) : null}
      </dl>
      {decidable ? (
        <form noValidate className="mt-5 space-y-3" onSubmit={decide('reject')}>
          {ticket.status === 'awaiting_dev' && ticket.devDueAt ? (
            <p className={`rounded-xl px-3 py-2 text-[13px] ${TONE_CLASS.warning}`}>
              Le développeur peut répondre jusqu’au {new Date(ticket.devDueAt).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}. Avant cette date, la décision sera refusée.
            </p>
          ) : null}
          <FormAlert message={resolve.error ? errorMessage(resolve.error) : null} />
          <textarea
            rows={3}
            value={resolution}
            onChange={e => {
              setResolution(e.target.value);
              setFieldErr(null);
            }}
            aria-invalid={fieldErr ? true : undefined}
            placeholder="Motif de la décision, visible par les deux parties."
            className={`w-full rounded-2xl border bg-f-card px-4 py-3 text-[15px] outline-none focus:border-[var(--color-accent)] ${fieldErr ? 'border-[var(--danger)]' : 'border-f-line'}`}
          />
          {fieldErr ? <p className="text-[13px] font-medium text-[var(--danger-800)]">{fieldErr}</p> : null}
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={decide('release')} disabled={resolve.isPending} className="cta-primary rounded-full px-5 py-3 text-[14.5px]">
              {resolve.isPending ? <SpinnerIcon /> : null} Reconnaître le paiement
            </button>
            <button type="submit" disabled={resolve.isPending} className="cta-ghost rounded-full px-5 py-3 text-[14.5px]">
              Refuser
            </button>
          </div>
          <p className="text-[12.5px] text-f-muted">Reconnaître le paiement le confirme à la place du développeur ; l’administration ne manipule jamais l’argent.</p>
        </form>
      ) : null}
    </Card>
  );
}

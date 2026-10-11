'use client';

import { useState, type FormEvent } from 'react';
import { FormAlert } from '@/components/auth/Field';
import { SpinnerIcon } from '@/components/auth/AuthIcons';
import { PROVIDER_NAME, ProviderLogo } from '@/components/payments/ProviderLogo';
import { useToast } from '@/components/Toast';
import { errorMessage } from '@/lib/api/client';
import type { Ticket } from '@/lib/contracts';
import { formatXof } from '@/lib/delivery-ui';
import { useAnswerTicket, useDevTickets, useTicket } from '@/lib/queries/tickets';
import { Card, Skeleton } from './ui';

const STATUS_TEXT: Record<Ticket['status'], string> = {
  awaiting_dev: 'Le client conteste : à vous de répondre',
  open: 'Réponse envoyée : l’équipe Fid’s tranche',
  resolved_released: 'Ticket clos : paiement reconnu',
  resolved_rejected: 'Ticket clos : paiement non reconnu',
};

/** Ticket ouvert par le client sur cette livraison (après « rien reçu » ou 48 h sans réponse). */
export function TicketPanel({ deliveryId }: { deliveryId: string }) {
  const { data: tickets } = useDevTickets();
  const latest = tickets?.find(t => t.deliveryId === deliveryId);
  if (!latest) return null;
  return <TicketCard ticketId={latest.id} deliveryId={deliveryId} />;
}

function TicketCard({ ticketId, deliveryId }: { ticketId: string; deliveryId: string }) {
  const { data, isPending, error } = useTicket(ticketId);
  const answer = useAnswerTicket();
  const { showToast } = useToast();
  const [text, setText] = useState('');
  const [fieldErr, setFieldErr] = useState<string | null>(null);

  if (isPending) return <Skeleton className="h-40" />;
  if (error) return <Card className="p-6 text-[14px] text-[var(--danger-800)]">{errorMessage(error)}</Card>;

  const { ticket, payment } = data;
  const waiting = ticket.status === 'awaiting_dev';

  const send = (acknowledgePayment: boolean) => (e: FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 5) {
      setFieldErr('Écrivez une réponse (5 caractères minimum).');
      return;
    }
    answer.mutate(
      { ticketId, deliveryId, answer: text.trim(), acknowledgePayment },
      {
        onSuccess: () => showToast(acknowledgePayment ? 'Paiement reconnu : la livraison continue' : 'Réponse envoyée', 'success'),
      },
    );
  };

  return (
    <Card className={`p-6 ${waiting ? 'border-[var(--danger)]' : ''}`}>
      <div className="flex items-center gap-2">
        {waiting ? <span aria-hidden className="size-2.5 animate-pulse rounded-full bg-[var(--danger)]" /> : null}
        <h2 className="heading-sans text-[16px]">{STATUS_TEXT[ticket.status]}</h2>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-2xl bg-f-surface p-3">
        <ProviderLogo provider={payment.provider} size={36} className="shrink-0 rounded-lg" />
        <p className="min-w-0 text-[13.5px]">
          <strong>{formatXof(payment.amountXof)}</strong> · {PROVIDER_NAME[payment.provider]} · réf. <span className="font-mono">{payment.transactionRef}</span>
          <span className="block text-f-muted">Déclaré par {payment.payerName}</span>
        </p>
      </div>

      <blockquote className="mt-4 rounded-2xl border-l-4 border-[var(--color-accent)] bg-f-surface px-4 py-3 text-[14.5px]">
        <span className="block text-[12px] font-semibold uppercase tracking-[.08em] text-f-muted">Le client</span>
        {ticket.clientClaim}
      </blockquote>

      {ticket.devAnswer ? (
        <p className="mt-3 rounded-2xl bg-f-surface px-4 py-3 text-[14.5px]">
          <span className="block text-[12px] font-semibold uppercase tracking-[.08em] text-f-muted">Votre réponse</span>
          {ticket.devAnswer}
        </p>
      ) : null}
      {ticket.resolution ? <p className="mt-3 text-[14px] text-f-muted">Décision : {ticket.resolution}</p> : null}

      {waiting ? (
        <form noValidate className="mt-5 space-y-3" onSubmit={send(false)}>
          {ticket.devDueAt ? (
            <p className="text-[13.5px] text-[var(--danger-800)]">
              Répondez avant le {new Date(ticket.devDueAt).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })} : sans réponse, l’équipe Fid’s tranchera sur les preuves du client.
            </p>
          ) : null}
          <FormAlert message={answer.error ? errorMessage(answer.error) : null} />
          <label className="block">
            <span className="mb-1.5 block text-[13.5px] font-semibold">Votre réponse</span>
            <textarea
              rows={3}
              maxLength={2000}
              value={text}
              onChange={e => {
                setText(e.target.value);
                setFieldErr(null);
              }}
              aria-invalid={fieldErr ? true : undefined}
              placeholder="Ex. : après vérification, aucun dépôt de ce montant sur mon numéro ce jour-là."
              className={`w-full resize-y rounded-2xl border bg-f-card px-4 py-3 text-[15px] outline-none placeholder:text-f-muted/70 focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-accent)_18%,transparent)] ${
                fieldErr ? 'border-[var(--danger)]' : 'border-f-line focus:border-[var(--color-accent)]'
              }`}
            />
            {fieldErr ? <span className="mt-1.5 block text-[13px] font-medium text-[var(--danger-800)]">{fieldErr}</span> : null}
          </label>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={send(true)} disabled={answer.isPending} className="cta-primary rounded-full px-5 py-3 text-[15px]">
              {answer.isPending ? <SpinnerIcon /> : null} Finalement, j’ai bien reçu le paiement
            </button>
            <button type="submit" disabled={answer.isPending} className="cta-ghost rounded-full px-5 py-3 text-[15px]">
              Maintenir : rien reçu
            </button>
          </div>
        </form>
      ) : null}
    </Card>
  );
}

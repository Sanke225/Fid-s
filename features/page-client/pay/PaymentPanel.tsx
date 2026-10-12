'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { ProviderLogo } from '@/components/payments/ProviderLogo'
import { Button, Card, Notice } from '../components/ui'
import { deliveryKey } from '../delivery/useDelivery'
import { ApiError } from '../lib/api'
import type { Payment, PublicDelivery, Ticket } from '../lib/contracts'
import { formatDateTime, formatPhone, formatXof, providerLabel } from '../lib/format'
import { api } from '../lib/publicApi'
import { payerTokenStore } from '../lib/storage'
import { PayFlow, type Declaration } from './PayFlow'

const errorMessages: Record<string, string> = {
  DELIVERY_NOT_PAYABLE: 'Cette livraison ne peut pas être payée pour le moment. La page va se mettre à jour.',
  PAYMENT_ALREADY_DECLARED: 'Un paiement a déjà été déclaré pour cette livraison et attend la confirmation du développeur.',
  TRANSACTION_REF_ALREADY_USED: 'Cette référence a déjà été utilisée. Vérifiez le SMS de confirmation.',
  PAYOUT_METHOD_NOT_FOUND: 'Ce numéro n’est plus proposé par le développeur. La page va se mettre à jour.',
  VALIDATION_ERROR: 'Certaines informations sont invalides. Vérifiez le numéro et la référence.',
}
const messageOf = (e: unknown) =>
  e instanceof ApiError ? (errorMessages[e.code] ?? e.message) : e ? 'Une erreur est survenue. Réessayez dans un instant.' : null

/** Détail du paiement déclaré par cet appareil (jeton payeur), et ses éventuels tickets. */
function usePayerPayment(token: string, paymentId: string | null) {
  const payerToken = payerTokenStore.get(token)
  const enabled = Boolean(paymentId && payerToken)
  const payment = useQuery({
    queryKey: ['public-payment', paymentId],
    queryFn: () => api.getPayment(paymentId!, payerToken!),
    enabled,
    refetchInterval: 5_000,
  })
  const tickets = useQuery({
    queryKey: ['public-tickets', paymentId],
    queryFn: () => api.getTickets(paymentId!, payerToken!),
    enabled,
    refetchInterval: 10_000,
  })
  // Heure du dernier rafraîchissement (toutes les 5 s) : sert à savoir si les 48 h sont passées
  // sans appeler Date.now() pendant le rendu.
  return { payment: payment.data, checkedAt: payment.dataUpdatedAt, tickets: tickets.data ?? [], payerToken }
}

/** Paiement direct au développeur : le client paie sur un numéro du dev, puis déclare la référence. */
export function PaymentPanel({ token, delivery }: { token: string; delivery: PublicDelivery }) {
  const [paying, setPaying] = useState(false)
  const active = delivery.activePayment
  const { payment, checkedAt, tickets } = usePayerPayment(token, active?.id ?? null)
  const ticket = tickets[0]

  if (delivery.payoutMethods.length === 0) {
    return <Notice tone="warn">Le paiement n’est pas encore ouvert pour cette livraison : {delivery.devName} n’a enregistré aucun numéro. Contactez-le.</Notice>
  }

  // Ticket en cours ou tranché : c'est lui qui décrit la suite.
  if (ticket) return <TicketCard ticket={ticket} devName={delivery.devName} />

  // Paiement déclaré : l'écran d'attente s'affiche tout de suite, le détail s'y ajoute dès qu'il arrive.
  if (active?.status === 'declared') {
    const devSilent = payment ? new Date(payment.expiresAt).getTime() <= checkedAt : false
    if (devSilent && payment) return <ContestCard token={token} payment={payment} devName={delivery.devName} reason="silent" />
    return <WaitingCard payment={payment} devName={delivery.devName} />
  }

  if (active?.status === 'rejected' && !paying) {
    if (!payment) return <Notice tone="danger">{delivery.devName} indique n’avoir rien reçu. Chargement du détail…</Notice>
    return (
      <div className="flex flex-col gap-3">
        <ContestCard token={token} payment={payment} devName={delivery.devName} reason="rejected" />
        <Button variant="secondary" className="w-full" onClick={() => setPaying(true)}>
          Je me suis trompé : déclarer un nouveau paiement
        </Button>
      </div>
    )
  }

  if (!paying) {
    return (
      <Button className="min-h-14 w-full text-base" onClick={() => setPaying(true)}>
        Payer {formatXof(delivery.amountXof)}
      </Button>
    )
  }
  return <DeclarePayment token={token} delivery={delivery} onCancel={() => setPaying(false)} />
}

function DeclarePayment({ token, delivery, onCancel }: { token: string; delivery: PublicDelivery; onCancel: () => void }) {
  const queryClient = useQueryClient()
  const declare = useMutation({
    mutationFn: (d: Declaration) =>
      api.declarePayment(token, { payoutMethodId: d.target.key, payerName: d.payerName, payerPhone: d.payerPhone, transactionRef: d.transactionRef }),
    onSuccess: ({ payerToken }) => {
      // Ce jeton prouve que CET appareil a payé : il servira aux frais Fid’s et à l'espace client.
      payerTokenStore.set(token, payerToken)
      void queryClient.invalidateQueries({ queryKey: deliveryKey(token) })
    },
    onError: (err) => {
      if (err instanceof ApiError && ['DELIVERY_NOT_PAYABLE', 'PAYOUT_METHOD_NOT_FOUND'].includes(err.code)) {
        void queryClient.invalidateQueries({ queryKey: deliveryKey(token) })
      }
    },
  })

  return (
    <PayFlow
      targets={delivery.payoutMethods.map((m) => ({ key: m.id, provider: m.provider, phone: m.phone, label: m.label }))}
      amountXof={delivery.amountXof}
      payee={delivery.devName}
      submitLabel="J’ai payé : déclarer mon paiement"
      pending={declare.isPending || declare.isSuccess}
      error={messageOf(declare.error)}
      onDeclare={(d) => declare.mutate(d)}
      onCancel={onCancel}
    />
  )
}

function PaymentSummary({ payment }: { payment: Payment }) {
  return (
    <div className="mt-4 flex items-center gap-3 rounded-xl bg-paper p-3 ring-1 ring-line">
      <ProviderLogo provider={payment.provider} size={36} className="shrink-0 rounded-lg" />
      <div className="min-w-0 text-sm">
        <p className="font-semibold tabular">
          {formatXof(payment.amountXof)} · {providerLabel[payment.provider]} {formatPhone(payment.payeePhone)}
        </p>
        <p className="font-mono text-xs text-ink-mute">Réf. {payment.transactionRef}</p>
      </div>
    </div>
  )
}

function WaitingCard({ payment, devName }: { payment?: Payment; devName: string }) {
  return (
    <Card className="animate-rise">
      <div className="flex items-start gap-3">
        <span className="relative mt-1 flex size-3">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand opacity-60" />
          <span className="relative inline-flex size-3 rounded-full bg-brand" />
        </span>
        <div className="flex-1" role="status">
          <p className="font-semibold">Paiement déclaré, en attente de {devName}</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">
            {devName} vérifie la réception sur son compte. Cette page se met à jour toute seule dès qu’il confirme.
          </p>
        </div>
      </div>
      {payment ? (
        <>
          <PaymentSummary payment={payment} />
          <p className="mt-3 text-xs leading-relaxed text-ink-mute">
            Sans réponse avant le {formatDateTime(payment.expiresAt)}, vous pourrez ouvrir un ticket avec vos preuves.
          </p>
        </>
      ) : null}
    </Card>
  )
}

function ContestCard({ token, payment, devName, reason }: { token: string; payment: Payment; devName: string; reason: 'rejected' | 'silent' }) {
  const queryClient = useQueryClient()
  const [claim, setClaim] = useState('')
  const [touched, setTouched] = useState(false)
  const open = useMutation({
    mutationFn: () => api.openTicket(payment.id, payerTokenStore.get(token) ?? '', claim.trim()),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['public-tickets', payment.id] })
      void queryClient.invalidateQueries({ queryKey: deliveryKey(token) })
    },
  })
  const claimError = claim.trim().length < 10 ? 'Décrivez votre paiement en quelques phrases (10 caractères minimum).' : null

  function submit(e: FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!claimError) open.mutate()
  }

  return (
    <Card className="animate-rise">
      <Notice tone={reason === 'rejected' ? 'danger' : 'warn'}>
        {reason === 'rejected' ? (
          <>
            {devName} indique n’avoir rien reçu
            {payment.rejectionReason ? <> : « {payment.rejectionReason} »</> : null}.
          </>
        ) : (
          <>{devName} n’a pas confirmé votre paiement dans les 48 heures.</>
        )}
      </Notice>
      <PaymentSummary payment={payment} />
      <form onSubmit={submit} noValidate className="mt-4 flex flex-col gap-2">
        <label htmlFor={`claim-${payment.id}`} className="text-sm font-semibold">
          Ouvrir un ticket
        </label>
        <p className="text-xs leading-relaxed text-ink-mute">
          Expliquez votre paiement (date, heure, numéro utilisé). {devName} aura 48 heures pour répondre ; sinon, l’équipe Fid’s tranche sur preuves.
        </p>
        <textarea
          id={`claim-${payment.id}`}
          rows={4}
          maxLength={2000}
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
          placeholder="Ex. : j’ai envoyé le montant le 11 octobre vers 15 h depuis le 07 07 12 34 56 ; j’ai le SMS de confirmation."
          className={`w-full rounded-xl bg-card px-3 py-2.5 text-[16px] ring-1 outline-none focus:ring-2 focus:ring-brand ${touched && claimError ? 'ring-danger' : 'ring-line'}`}
        />
        {touched && claimError ? <p className="text-sm text-danger">{claimError}</p> : null}
        {open.error ? <Notice tone="danger">{messageOf(open.error)}</Notice> : null}
        <Button type="submit" variant="secondary" loading={open.isPending} className="mt-1 w-full">
          Ouvrir le ticket
        </Button>
      </form>
    </Card>
  )
}

function TicketCard({ ticket, devName }: { ticket: Ticket; devName: string }) {
  const resolved = ticket.status === 'resolved_released' || ticket.status === 'resolved_rejected'
  return (
    <Card className="animate-rise">
      <p className="font-semibold">{resolved ? 'Ticket tranché' : 'Ticket ouvert'}</p>
      <p className="mt-1 text-sm leading-relaxed text-ink-soft" role="status">
        {ticket.status === 'awaiting_dev' && ticket.devDueAt
          ? `${devName} doit répondre avant le ${formatDateTime(ticket.devDueAt)}. Sinon, l’équipe Fid’s tranchera sur preuves.`
          : ticket.status === 'open'
            ? 'L’équipe Fid’s examine votre demande.'
            : ticket.status === 'resolved_released'
              ? 'Votre paiement a été reconnu : la livraison continue.'
              : 'Après examen, le paiement n’a pas pu être reconnu.'}
      </p>
      {ticket.devAnswer ? (
        <p className="mt-3 rounded-xl bg-paper p-3 text-sm ring-1 ring-line">
          <span className="font-semibold">Réponse de {devName} :</span> {ticket.devAnswer}
        </p>
      ) : null}
      {ticket.resolution ? (
        <p className="mt-3 rounded-xl bg-paper p-3 text-sm ring-1 ring-line">
          <span className="font-semibold">Décision :</span> {ticket.resolution}
        </p>
      ) : null}
    </Card>
  )
}
